import React, { useState } from 'react';
import { products, Product, categories, brands } from '../data/mockData';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', 'Low Stock': 'chip-warning' };
  return map[status] ?? 'chip-default';
};

const defaultForm: { name: string; category: string; brand: string; price: number; stock: number; unit: string; status: Product['status']; emoji: string } = { name: '', category: 'Dairy Products', brand: 'NatureFarm', price: 0, stock: 0, unit: 'Kg', status: 'Active', emoji: '🌾' };

const Products: React.FC = () => {
  const [items, setItems] = useState<Product[]>(products);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [deleteConf, setDeleteConf] = useState<number | null>(null);

  const categoryNames = categories.map(c => c.name);
  const brandNames = brands.map(b => b.name);

  const openAdd = () => { setForm(defaultForm); setEditing(null); setModal('add'); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, brand: p.brand, price: p.price, stock: p.stock, unit: p.unit, status: p.status, emoji: p.emoji });
    setEditing(p); setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setItems(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
    } else {
      setItems(prev => [{ id: Date.now(), ...form, sales: 0 }, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => { setItems(prev => prev.filter(p => p.id !== id)); setDeleteConf(null); };

  const filtered = items.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">{items.length} products in catalogue</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-product-btn">+ Add Product</button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search products, category, brand…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Active', 'Low Stock', 'Inactive'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Sales</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unit: {p.unit}</div>
                    </div>
                  </div>
                </td>
                <td><span className="chip chip-info">{p.category}</span></td>
                <td style={{ fontSize: 13 }}>{p.brand}</td>
                <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                <td>
                  <span style={{ fontWeight: 600, color: p.stock <= 10 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td><span className={`chip ${statusChip(p.status)}`}>{p.status}</span></td>
                <td style={{ fontWeight: 600 }}>{p.sales.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConf(p.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Organic A2 Cow Milk" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input className="form-input" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} maxLength={4} style={{ textAlign: 'center', fontSize: 22 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input className="form-input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="e.g. Kg, L, Jar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {categoryNames.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select className="form-select" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                    {brandNames.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} min={0} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                    {['Active','Inactive','Low Stock'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === 'add' ? 'Add Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConf !== null && (
        <div className="modal-backdrop" onClick={() => setDeleteConf(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Product</div>
              <button className="modal-close" onClick={() => setDeleteConf(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>This will permanently remove the product.</p>
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

export default Products;
