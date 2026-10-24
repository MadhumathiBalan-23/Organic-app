import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Award, MapPin, Package, Star } from 'lucide-react';
import { Brand, fetchBrandsFromDB } from '../data/mockData';
import { createBrandAPI, updateBrandAPI, deleteBrandAPI } from '../services/api';

const defaultForm: Omit<Brand, 'id'> = { name: '', emoji: '', origin: '', productCount: 0, established: '', rating: 4.5 };

const Brands: React.FC = () => {
  const [items, setItems] = useState<Brand[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Omit<Brand, 'id'>>(defaultForm);
  const [search, setSearch] = useState('');
  const [deleteConf, setDeleteConf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const dbBrands = await fetchBrandsFromDB();
      setItems(dbBrands);
    } catch (e) {
      console.error('Failed to load brands from API:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAdd = () => { setForm(defaultForm); setEditing(null); setModal('add'); };
  const openEdit = (b: Brand) => { setForm({ name: b.name, emoji: b.emoji, origin: b.origin, productCount: b.productCount, established: b.established, rating: b.rating }); setEditing(b); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editing) {
      try {
        await updateBrandAPI(editing.id, {
          name: form.name,
          origin: form.origin,
          rating: form.rating
        });
      } catch (e) {
        console.warn('API update brand error:', e);
      }
      setItems(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
    } else {
      try {
        const res = await createBrandAPI({
          name: form.name,
          origin: form.origin,
          rating: form.rating,
          productCount: form.productCount
        });
        const newBrand: Brand = {
          id: res.data ? res.data.id : Date.now(),
          ...form
        };
        setItems(prev => [newBrand, ...prev]);
      } catch (e) {
        console.warn('API create brand error:', e);
      }
    }
    closeModal();
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteBrandAPI(id);
    } catch (e) {
      console.warn('API delete brand error:', e);
    }
    setItems(prev => prev.filter(b => b.id !== id));
    setDeleteConf(null);
  };

  const filtered = items.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.origin.toLowerCase().includes(search.toLowerCase()));

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={14}
            fill={i <= rounded ? '#f59e0b' : 'none'}
            color={i <= rounded ? '#f59e0b' : '#cbd5e1'}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Brands</div>
          <div className="page-subtitle">{items.length} partner brands active in catalogue</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-brand-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search brands, origin…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading partner brands directly from live API...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Award size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
          No brands found.
        </div>
      ) : (
        <div className="brand-grid">
          {filtered.map(b => (
            <div key={b.id} className="brand-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(46,125,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Award size={22} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openEdit(b)} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn-icon danger" onClick={() => setDeleteConf(b)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>{b.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                <MapPin size={13} color="var(--color-primary)" /> {b.origin} · Est. {b.established}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {renderStars(b.rating)}
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{b.rating}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                <span className="chip chip-default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Package size={12} /> {b.productCount} Products
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Farm</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add New Brand' : 'Edit Brand'}</span>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Brand Name *</label>
              <input className="form-input" placeholder="e.g. Pure Harvest" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Origin / State</label>
              <input className="form-input" placeholder="e.g. Punjab, Tamil Nadu…" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Est. Year</label>
                <input className="form-input" placeholder="2018" value={form.established} onChange={e => setForm({ ...form, established: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (1-5)</label>
                <input className="form-input" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) || 4.5 })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Brand</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conf */}
      {deleteConf && (
        <div className="modal-overlay" onClick={() => setDeleteConf(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Brand</span>
              <button className="modal-close" onClick={() => setDeleteConf(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Are you sure you want to delete brand <strong>{deleteConf.name}</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConf(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConf.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
