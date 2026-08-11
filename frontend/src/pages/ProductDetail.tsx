import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock adjustment form
  const [adjQuantity, setAdjQuantity] = useState('');
  const [adjType, setAdjType] = useState('IN');
  const [adjReason, setAdjReason] = useState('');
  const [adjSubmitting, setAdjSubmitting] = useState(false);
  const [adjError, setAdjError] = useState('');
  const [adjSuccess, setAdjSuccess] = useState('');

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError('Failed to load product.');
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get(`/products/${id}/movements?limit=20`);
      setMovements(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProduct(), fetchMovements()]).finally(() => setLoading(false));
  }, [id]);

  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError('');
    setAdjSuccess('');
    setAdjSubmitting(true);
    try {
      await api.post(`/products/${id}/stock`, {
        quantity: parseInt(adjQuantity),
        type: adjType,
        reason: adjReason,
      });
      setAdjSuccess(`Stock ${adjType === 'IN' ? 'added' : 'removed'} successfully.`);
      setAdjQuantity('');
      setAdjReason('');
      fetchProduct();
      fetchMovements();
    } catch (err: any) {
      setAdjError(err.response?.data?.message || 'Stock adjustment failed.');
    } finally {
      setAdjSubmitting(false);
    }
  };

  if (loading) return <p className="text-muted">Loading product...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found.</div>;

  const isLow = product.current_stock <= product.minimum_stock;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/products" className="text-muted" style={{ fontSize: '0.875rem' }}>← Back to Products</Link>
          <h1 style={{ marginTop: '0.5rem' }}>{product.name}</h1>
        </div>
        <Link to={`/products/${id}/edit`} className="btn btn-primary">Edit Product</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Product Info */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Product Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>SKU</span>
              <p style={{ fontWeight: 500 }}>{product.sku}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</span>
              <p style={{ fontWeight: 500 }}>{product.category || '—'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Unit Price</span>
              <p style={{ fontWeight: 500 }}>₹{product.unit_price.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Location</span>
              <p style={{ fontWeight: 500 }}>{product.warehouse_location || '—'}</p>
            </div>
          </div>

          {/* Stock Display */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: isLow ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${isLow ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Stock</span>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: isLow ? 'var(--danger)' : 'var(--secondary)' }}>{product.current_stock}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Minimum Stock</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{product.minimum_stock}</p>
              </div>
            </div>
            {isLow && (
              <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem', marginTop: '0.5rem' }}>
                ⚠ Stock is at or below minimum level. Reorder recommended.
              </p>
            )}
          </div>
        </div>

        {/* Stock Adjustment Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Adjust Stock</h3>
          <form onSubmit={handleStockAdjust}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="adjType" value="IN" checked={adjType === 'IN'} onChange={() => setAdjType('IN')} style={{ width: 'auto' }} />
                  <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>Stock IN</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="adjType" value="OUT" checked={adjType === 'OUT'} onChange={() => setAdjType('OUT')} style={{ width: 'auto' }} />
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Stock OUT</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input type="number" min="1" value={adjQuantity} onChange={(e) => setAdjQuantity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input type="text" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="e.g. New purchase, Damaged goods..." />
            </div>
            {adjError && <div className="error-message" style={{ marginBottom: '0.5rem' }}>{adjError}</div>}
            {adjSuccess && <div style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{adjSuccess}</div>}
            <button type="submit" className="btn btn-primary" disabled={adjSubmitting}>
              {adjSubmitting ? 'Adjusting...' : 'Apply Adjustment'}
            </button>
          </form>
        </div>
      </div>

      {/* Movement History */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Stock Movement History</h3>
        {movements.length === 0 ? (
          <p className="text-muted">No stock movements recorded.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${m.type === 'IN' ? 'status-confirmed' : 'status-cancelled'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: m.type === 'IN' ? 'var(--secondary)' : 'var(--danger)' }}>
                    {m.type === 'IN' ? '+' : '-'}{m.quantity}
                  </td>
                  <td>{m.reason || '—'}</td>
                  <td>{m.user?.name || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
