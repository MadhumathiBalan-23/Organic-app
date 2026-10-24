import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { Product, fetchProductsFromDB, fetchCategoriesFromDB, fetchBrandsFromDB } from '../data/mockData';
import { createProductAPI, updateProductAPI, deleteProductAPI } from '../services/api';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', 'Low Stock': 'chip-warning' };
  return map[status] ?? 'chip-default';
};

const defaultForm: { name: string; category: string; brand: string; price: number; stock: number; unit: string; status: Product['status']; emoji: string } = {
  name: '', category: 'Dairy & Pure Ghee', brand: 'NatureFarm', price: 0, stock: 0, unit: 'Kg', status: 'Active', emoji: ''
};

const Products: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>(['Dairy & Pure Ghee', 'Fresh Vegetables', 'Fresh Fruits']);
  const [brandNames, setBrandNames] = useState<string[]>(['NatureFarm', 'DesiDairy', 'GreenRoots']);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [deleteConf, setDeleteConf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brs] = await Promise.all([
        fetchProductsFromDB(),
        fetchCategoriesFromDB(),
        fetchBrandsFromDB()
      ]);
      setItems(prods);
      if (cats.length > 0) setCategoryNames(cats.map(c => c.name));
      if (brs.length > 0) setBrandNames(brs.map(b => b.name));
    } catch (e) {
      console.error('Failed to load products from API:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setForm({
      ...defaultForm,
      category: categoryNames[0] || 'Dairy & Pure Ghee',
      brand: brandNames[0] || 'NatureFarm'
    });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      unit: p.unit,
      status: p.status,
      emoji: p.emoji
    });
    setEditing(p);
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
        await updateProductAPI(editing.id, {
          name: form.name,
          categoryName: form.category,
          brand: form.brand,
          price: form.price,
          stock: form.stock,
          unit: form.unit
        });
      } catch (e) {
        console.warn('API update error:', e);
      }
      setItems(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
    } else {
      try {
        const res = await createProductAPI({
          name: form.name,
          category: form.category,
          brand: form.brand,
          price: form.price,
          stock: form.stock,
          unit: form.unit
        });
        const createdProd: Product = res.data ? {
          id: res.data.id,
          name: res.data.name,
          category: form.category,
          brand: form.brand,
          price: form.price,
          stock: form.stock,
          unit: form.unit,
          status: form.status,
          sales: 0,
          emoji: '',
          imageUrl: res.data.imageUrl,
          benefits: ['100% Organic', 'Farm Fresh']
        } : { id: 'p_' + Date.now(), ...form, sales: 0, benefits: ['100% Organic', 'Farm Fresh'] };
        setItems(prev => [createdProd, ...prev]);
      } catch (e) {
        console.warn('API create error:', e);
      }
    }
    closeModal();
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteProductAPI(id);
    } catch (e) {
      console.warn('API delete error:', e);
    }
    setItems(prev => prev.filter(p => p.id !== id));
    setDeleteConf(null);
  };

  const filtered = items.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">{items.length} products loaded live from API</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-product-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}><Search size={16} /></span>
          <input placeholder="Search products, category, brand…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Active', 'Low Stock', 'Inactive'].map(s => (
          <button key={s} className={`filter-chip${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading products directly from live API...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
            No products match the selected criteria.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--bg-main)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={18} color="var(--color-primary)" />
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="chip chip-default">{p.category}</span></td>
                  <td>{p.brand}</td>
                  <td><strong>₹{p.price}</strong> / {p.unit}</td>
                  <td>
                    <span style={{ color: p.stock < 20 ? 'var(--color-danger)' : 'inherit', fontWeight: p.stock < 20 ? 700 : 400 }}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td><span className={`chip ${statusChip(p.status)}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => openEdit(p)} title="Edit"><Edit2 size={15} /></button>
                      <button className="btn-icon danger" onClick={() => setDeleteConf(p)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add New Product' : 'Edit Product'}</span>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" placeholder="e.g. Organic A2 Desi Cow Milk" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select className="form-select" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
                  {brandNames.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input className="form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" placeholder="L, Kg, 500g…" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="Active">Active</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConf && (
        <div className="modal-overlay" onClick={() => setDeleteConf(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Product</span>
              <button className="modal-close" onClick={() => setDeleteConf(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Are you sure you want to permanently delete <strong>{deleteConf.name}</strong>? This will remove it from the backend SQLite database.
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

export default Products;
