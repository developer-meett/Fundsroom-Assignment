import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Follow-up form
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [followUpError, setFollowUpError] = useState('');

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      setError('Failed to load customer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete customer.');
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFollowUpError('');
    setSubmitting(true);
    try {
      await api.post(`/customers/${id}/followups`, {
        note,
        follow_up_date: followUpDate || null,
      });
      setNote('');
      setFollowUpDate('');
      fetchCustomer(); // Refresh to show new follow-up
    } catch (err: any) {
      setFollowUpError(err.response?.data?.message || 'Failed to add follow-up.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-muted">Loading customer...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!customer) return <div className="error-message">Customer not found.</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/customers" className="text-muted" style={{ fontSize: '0.875rem' }}>← Back to Customers</Link>
          <h1 style={{ marginTop: '0.5rem' }}>{customer.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/customers/${id}/edit`} className="btn btn-primary">Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Customer Info Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Customer Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Business</span>
              <p style={{ fontWeight: 500 }}>{customer.business_name || '—'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Mobile</span>
              <p style={{ fontWeight: 500 }}>{customer.mobile}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</span>
              <p style={{ fontWeight: 500 }}>{customer.email || '—'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>GST Number</span>
              <p style={{ fontWeight: 500 }}>{customer.gst_number || '—'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</span>
              <p style={{ fontWeight: 500 }}>{customer.customer_type || '—'}</p>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</span>
              <p>
                <span className={`status-badge ${customer.status === 'ACTIVE' ? 'status-confirmed' : 'status-cancelled'}`}>
                  {customer.status}
                </span>
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Address</span>
              <p style={{ fontWeight: 500 }}>{customer.address || '—'}</p>
            </div>
            {customer.notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Notes</span>
                <p>{customer.notes}</p>
              </div>
            )}
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Follow-up Date</span>
              <p style={{ fontWeight: 500 }}>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        </div>

        {/* Follow-ups Section */}
        <div>
          {/* Add Follow-up Form */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Add Follow-up</h3>
            <form onSubmit={handleFollowUp}>
              <div className="form-group">
                <label className="form-label">Note *</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter follow-up note..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Next Follow-up Date</label>
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              </div>
              {followUpError && <div className="error-message" style={{ marginBottom: '0.5rem' }}>{followUpError}</div>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Follow-up'}
              </button>
            </form>
          </div>

          {/* Follow-up History */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Follow-up History</h3>
            {(!customer.follow_ups || customer.follow_ups.length === 0) ? (
              <p className="text-muted">No follow-ups recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customer.follow_ups.map((f: any) => (
                  <div key={f.id} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: 500 }}>{f.note}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>By {f.user?.name || 'Unknown'}</span>
                      <span>{new Date(f.created_at).toLocaleDateString()}</span>
                      {f.follow_up_date && <span>Next: {new Date(f.follow_up_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
