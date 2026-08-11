import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ChallanDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState('');

  const fetchChallan = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data);
    } catch (err) {
      setError('Failed to load challan details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will permanently deduct stock from inventory.')) return;
    
    setConfirmError('');
    setConfirmSuccess('');
    setConfirming(true);
    
    try {
      await api.post(`/challans/${id}/confirm`);
      setConfirmSuccess('Challan confirmed successfully! Stock has been deducted.');
      fetchChallan(); // Refresh to get new status
    } catch (err: any) {
      // Show exact useful error from backend (e.g. Insufficient stock for product X)
      setConfirmError(err.response?.data?.message || 'Failed to confirm challan.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft?')) return;
    try {
      await api.post(`/challans/${id}/cancel`);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  if (loading) return <p className="text-muted">Loading challan...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!challan) return <div className="error-message">Challan not found.</div>;

  const isDraft = challan.status === 'DRAFT';
  const canConfirm = isDraft && ['ADMIN', 'SALES', 'WAREHOUSE'].includes(user?.role || '');

  let totalValue = 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/challans" className="text-muted" style={{ fontSize: '0.875rem' }}>← Back to Challans</Link>
          <h1 style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {challan.challan_number}
            <span className={`status-badge status-${challan.status.toLowerCase()}`} style={{ fontSize: '1rem', verticalAlign: 'middle' }}>
              {challan.status}
            </span>
          </h1>
        </div>
        
        {isDraft && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {canConfirm && (
              <button className="btn btn-primary" onClick={handleConfirm} disabled={confirming}>
                {confirming ? 'Confirming...' : 'Confirm Challan (Deduct Stock)'}
              </button>
            )}
            <button className="btn btn-danger" onClick={handleCancel}>Cancel Draft</button>
          </div>
        )}
      </div>

      {confirmError && (
        <div className="card" style={{ backgroundColor: 'var(--card-bg)', border: '2px solid var(--danger)', marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Confirmation Failed</h3>
          <p>{confirmError}</p>
        </div>
      )}

      {confirmSuccess && (
        <div className="card" style={{ backgroundColor: 'var(--card-bg)', border: '2px solid var(--secondary)', marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Success</h3>
          <p>{confirmSuccess}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Customer Details</h3>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{challan.customer?.name}</p>
          {challan.customer?.business_name && <p className="text-muted">{challan.customer.business_name}</p>}
          <p style={{ marginTop: '0.5rem' }}>📞 {challan.customer?.mobile}</p>
          <p>📍 {challan.customer?.address || 'No address provided'}</p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Challan Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Created By</span>
              <p style={{ fontWeight: 500 }}>{challan.user?.name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</span>
              <p style={{ fontWeight: 500 }}>{new Date(challan.created_at).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Quantity</span>
              <p style={{ fontWeight: 500, fontSize: '1.25rem' }}>{challan.total_quantity} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <h3 style={{ padding: '1.5rem 1.5rem 0', marginBottom: '1rem' }}>Included Products</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {challan.items?.map((item: any) => {
              const subtotal = item.quantity * item.unit_price;
              totalValue += subtotal;
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td className="text-muted">{item.sku}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.unit_price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{subtotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: 'var(--bg-color)' }}>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total Value:</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{challan.total_quantity}</td>
              <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{totalValue.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
