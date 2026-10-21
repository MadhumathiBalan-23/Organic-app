import React, { useState } from 'react';
import { categories, Category } from '../data/mockData';

const defaultForm: Omit<Category, 'id'> = {
  name: '', emoji: '🌿', description: '', productCount: 0, color: '#22c55e'
};

const colorOptions = ['#3b82f6','#22c55e','#f59e0b','#d97706','#f97316','#84cc16','#10b981','#ef4444','#a855f7','#ec4899'];

const Categories: React.FC = () => {
  const [items, setItems] = useState<Category[]>(categories);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(defaultForm);
  const [search, setSearch] = useState('');
  const [deleteConf, setDeleteConf] = useState<number | null>(null);

  const openAdd = () => { setForm(defaultForm); setEditing(null); setModal('add'); };
  const openEdit = (cat: Category) => { setForm({ name: cat.name, emoji: cat.emoji, description: cat.description, productCount: cat.productCount, color: cat.color }); setEditing(cat); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setItems(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      const newCat: Category = { id: Date.now(), ...form };
      setItems(prev => [newCat, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
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
          <div className="page-subtitle">{items.length} categories · {items.reduce((s,c)=>s+c.productCount,0)} total products</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-category-btn">+ Add Category</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="search-bar" style={{ maxWidth: 340 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      <div className="item-grid">
        {filtered.map(cat => (
          <div key={cat.id} className="item-card">
            <div className="item-card-icon" style={{ background: cat.color + '22' }}>
              <span style={{ fontSize: 26 }}>{cat.emoji}</span>
            </div>
            <div>
              <div className="item-card-name">{cat.name}</div>
              <div className="item-card-sub">{cat.description}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="chip chip-success">📦 {cat.productCount} products</span>
            </div>
            <div className="item-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConf(cat.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-text">No categories found</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? '➕ Add Category' : '✏️ Edit Category'}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input className="form-input" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} maxLength={4} style={{ width: 80, fontSize: 24, textAlign: 'center' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Fresh Vegetables" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {colorOptions.map(c => (
                    <div key={c} onClick={() => setForm({...form, color: c})}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: form.color === c ? '3px solid #1B4332' : '3px solid transparent', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === 'add' ? 'Add Category' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConf !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConf(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Category</div>
              <button className="modal-close" onClick={() => setDeleteConf(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
              Are you sure? This action cannot be undone.
            </p>
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

export default Categories;
