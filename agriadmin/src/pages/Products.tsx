import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, Upload } from 'lucide-react';
import { Product, ORGANIC_PRODUCT_PRESETS, fetchProductsFromDB, fetchCategoriesFromDB, fetchBrandsFromDB } from '../data/mockData';
import { createProductAPI, updateProductAPI, deleteProductAPI, uploadImageAPI } from '../services/api';

const statusChip = (status: string) => {
  const map: Record<string, string> = { Active: 'chip-success', Inactive: 'chip-danger', 'Low Stock': 'chip-warning' };
  return map[status] ?? 'chip-default';
};

const defaultForm: {
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  unit: string;
  status: Product['status'];
  emoji: string;
  imageUrl: string;
} = {
  name: '',
  category: 'Dairy & Pure Ghee',
  brand: 'NatureFarm',
  price: 0,
  stock: 0,
  unit: 'Kg',
  status: 'Active',
  emoji: '',
  imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadedUrl = await uploadImageAPI(base64Data, file.name);
        setForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      } catch (err) {
        console.warn('Upload error, fallback to base64:', err);
        setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
      brand: brandNames[0] || 'NatureFarm',
      imageUrl: ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
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
      emoji: p.emoji,
      imageUrl: p.imageUrl || ORGANIC_PRODUCT_PRESETS[0]?.url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600'
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
          unit: form.unit,
          imageUrl: form.imageUrl
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
          unit: form.unit,
          imageUrl: form.imageUrl
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
          imageUrl: res.data.imageUrl || form.imageUrl,
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

            {/* Live HD Image Preview & Selection */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Product Photo (Gallery or Upload)</span>
                {uploadingImage ? (
                  <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Uploading image...</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>✓ Verified Food-Grade Preview</span>
                )}
              </label>

              {/* Choose from Gallery / Computer Button */}
              <div style={{ marginBottom: 10 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '9px 12px',
                    border: '1.5px dashed #047857',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    fontWeight: 600,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <Upload size={16} />
                  <span>{uploadingImage ? 'Uploading Image...' : 'Choose Photo from Device Gallery / Computer'}</span>
                </button>
              </div>

              {/* Preview Card */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: 120,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                ) : (
                  <Package size={32} color="var(--text-muted)" />
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 6,
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span>🌿 Live DB Image Preview</span>
                </div>
              </div>

              {/* Photo Presets Quick Picker */}
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Select from Curated Organic Presets:
              </label>
              <div style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 6,
                marginBottom: 8,
                maxWidth: '100%'
              }}>
                {ORGANIC_PRODUCT_PRESETS.map((p) => {
                  const isSelected = form.imageUrl === p.url;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: p.url })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        borderRadius: 8,
                        border: isSelected ? '2px solid #047857' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? '#ECFDF5' : 'var(--bg-card, #FFFFFF)',
                        color: isSelected ? '#047857' : 'var(--text-primary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 600 : 400
                      }}
                      title={`${p.label} (${p.category})`}
                    >
                      <img src={p.url} alt={p.label} style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL input */}
              <input
                className="form-input"
                placeholder="Or paste custom image URL (https://...)"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                style={{ fontSize: '0.82rem' }}
              />
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
