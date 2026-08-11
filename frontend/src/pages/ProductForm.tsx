import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '0',
    minimum_stock: '0',
    warehouse_location: '',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(res => {
          const p = res.data;
          setForm({
            name: p.name || '',
            sku: p.sku || '',
            category: p.category || '',
            unit_price: String(p.unit_price || ''),
            current_stock: String(p.current_stock || 0),
            minimum_stock: String(p.minimum_stock || 0),
            warehouse_location: p.warehouse_location || '',
          });
        })
        .catch(() => setError('Failed to load product.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, form);
      } else {
        await api.post('/products', form);
      }
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Loading product...</p>;

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input name="sku" value={form.sku} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input name="category" value={form.category} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price *</label>
            <input name="unit_price" type="number" step="0.01" value={form.unit_price} onChange={handleChange} required />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input name="current_stock" type="number" value={form.current_stock} onChange={handleChange} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Minimum Stock</label>
            <input name="minimum_stock" type="number" value={form.minimum_stock} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Warehouse Location</label>
            <input name="warehouse_location" value={form.warehouse_location} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/products')}
            style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
