import React, { useState, useEffect } from 'react';
import { brands, Brand, fetchBrandsFromDB } from '../data/mockData';

const defaultForm: Omit<Brand, 'id'> = { name: '', emoji: '🌱', origin: '', productCount: 0, established: '', rating: 4.5 };

const Brands: React.FC = () => {
  const [items, setItems] = useState<Brand[]>(brands);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Omit<Brand, 'id'>>(defaultForm);
  const [search, setSearch] = useState('');
  const [deleteConf, setDeleteConf] = useState<any>(null);

  useEffect(() => {
    fetchBrandsFromDB().then(dbBrands => {
      if (dbBrands && dbBrands.length > 0) {
        setItems(dbBrands);
      }
    });
  }, []);

  const openAdd = () => { setForm(defaultForm); setEditing(null); setModal('add'); };
  const openEdit = (b: Brand) => { setForm({ name: b.name, emoji: b.emoji, origin: b.origin, productCount: b.productCount, established: b.established, rating: b.rating }); setEditing(b); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setItems(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
    } else {
      setItems(prev => [{ id: Date.now(), ...form }, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => { setItems(prev => prev.filter(b => b.id !== id)); setDeleteConf(null); };

  const filtered = items.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.origin.toLowerCase().includes(search.toLowerCase()));

  const stars = (rating: number) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Brands</div>
          <div className="page-subtitle">{items.length} registered brands</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-brand-btn">+ Add Brand</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ maxWidth: 340 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search brands…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="item-grid">
        {filtered.map(brand => (
          <div key={brand.id} className="item-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="item-card-icon" style={{ background: 'var(--color-surface-2)' }}>
                <span style={{ fontSize: 26 }}>{brand.emoji}</span>
              </div>
              <div>
                <div className="item-card-name">{brand.name}</div>
                <div className="item-card-sub">📍 {brand.origin} · Est. {brand.established}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <span className="chip chip-info">📦 {brand.productCount} products</span>
              <span className="chip chip-warning" style={{ color: '#92400e', background: 'rgba(245,158,11,0.12)' }}>
                ⭐ {brand.rating}
              </span>
            </div>
            <div style={{ fontSize: 16, color: '#f59e0b', letterSpacing: 2 }}>{stars(brand.rating)}</div>
            <div className="item-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(brand)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConf(brand.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-icon">🌱</div>
            <div className="empty-state-text">No brands found</div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? '➕ Add Brand' : '✏️ Edit Brand'}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input className="form-input" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} maxLength={4} style={{ width: 80, fontSize: 24, textAlign: 'center' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. NatureFarm" />
              </div>
              <div className="form-group">
                <label className="form-label">Origin State</label>
                <input className="form-input" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} placeholder="e.g. Tamil Nadu" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Established Year</label>
                  <input className="form-input" value={form.established} onChange={e => setForm({...form, established: e.target.value})} placeholder="e.g. 2019" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1–5)</label>
                  <input className="form-input" type="number" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm({...form, rating: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === 'add' ? 'Add Brand' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConf !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConf(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Brand</div>
              <button className="modal-close" onClick={() => setDeleteConf(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>Are you sure? This cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConf(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConf!)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
