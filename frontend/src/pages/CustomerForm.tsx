import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: '',
    address: '',
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/customers/${id}`)
        .then(res => {
          const c = res.data;
          setForm({
            name: c.name || '',
            mobile: c.mobile || '',
            email: c.email || '',
            business_name: c.business_name || '',
            gst_number: c.gst_number || '',
            customer_type: c.customer_type || '',
            address: c.address || '',
            status: c.status || 'ACTIVE',
            notes: c.notes || '',
          });
        })
        .catch(() => setError('Failed to load customer.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, form);
      } else {
        await api.post('/customers', form);
      }
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Loading customer...</p>;

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile *</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input name="business_name" value={form.business_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input name="gst_number" value={form.gst_number} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Type</label>
            <select name="customer_type" value={form.customer_type} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}>
              <option value="">Select</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="RETAIL">Retail</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
          {isEdit && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/customers')}
            style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
