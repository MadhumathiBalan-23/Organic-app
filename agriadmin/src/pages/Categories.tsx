import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Tags, Package } from 'lucide-react';
import { Category, fetchCategoriesFromDB } from '../data/mockData';
import { createCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from '../services/api';

const defaultForm: Omit<Category, 'id'> = {
  name: '', emoji: '', description: '', productCount: 0, color: '#22c55e'
};

const colorOptions = ['#3b82f6','#22c55e','#f59e0b','#d97706','#f97316','#84cc16','#10b981','#ef4444','#a855f7','#ec4899'];

const Categories: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(defaultForm);
  const [search, setSearch] = useState('');
  const [deleteConf, setDeleteConf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const dbCategories = await fetchCategoriesFromDB();
      setItems(dbCategories);
    } catch (e) {
      console.error('Failed to load categories from API:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setForm(defaultForm);
    setEditing(null);
    setModal('add');
  };

  const openEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      productCount: cat.productCount,
      color: cat.color
    });
    setEditing(cat);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editing) {
      try {
        await updateCategoryAPI(editing.id, {
          name: form.name,
          description: form.description
        });
      } catch (e) {
        console.warn('API update category error:', e);
      }
      setItems(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      try {
        const res = await createCategoryAPI({
          name: form.name,
          description: form.description
        });
        const newCat: Category = {
          id: res.data ? res.data.id : Date.now(),
          ...form
        };
        setItems(prev => [newCat, ...prev]);
      } catch (e) {
        console.warn('API create category error:', e);
      }
    }
    closeModal();
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteCategoryAPI(id);
    } catch (e) {
      console.warn('API delete category error:', e);
    }
    setItems(prev => prev.filter(c => c.id !== id));
    setDeleteConf(null);
  };

  const filtered = items.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">{items.length} categories · {items.reduce((s,c)=>s+c.productCount,0)} total products in catalog</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-category-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading categories directly from live API...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Tags size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
          No categories found.
        </div>
      ) : (
        <div className="category-grid">
          {filtered.map(cat => (
            <div key={cat.id} className="category-card" style={{ borderTop: `4px solid ${cat.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                  <Tags size={20} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openEdit(cat)} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn-icon danger" onClick={() => setDeleteConf(cat)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, minHeight: 36 }}>{cat.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                <span className="chip chip-default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Package size={12} /> {cat.productCount} Products
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live API</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add New Category' : 'Edit Category'}</span>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input className="form-input" placeholder="e.g. Fresh Vegetables" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Brief description of products in this category…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Color Theme</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {colorOptions.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', backgroundColor: c, cursor: 'pointer',
                      border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                      transition: 'transform 0.15s'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conf */}
      {deleteConf && (
        <div className="modal-overlay" onClick={() => setDeleteConf(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Category</span>
              <button className="modal-close" onClick={() => setDeleteConf(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Are you sure you want to delete category <strong>{deleteConf.name}</strong>?
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

export default Categories;
