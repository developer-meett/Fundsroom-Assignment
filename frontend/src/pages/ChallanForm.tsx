import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const ChallanForm = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: '1' }]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch customers and products for dropdowns
    const loadDependencies = async () => {
      try {
        setLoadingData(true);
        // Assuming limit=1000 to get a full list for dropdowns for this simple demo
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=1000'),
          api.get('/products?limit=1000')
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      } catch (err) {
        setError('Failed to load customers or products.');
      } finally {
        setLoadingData(false);
      }
    };
    loadDependencies();
  }, []);

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: '1' }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!customerId) {
      setError('Please select a customer.');
      return;
    }
    
    // Validate items
    const validItems = items.filter(item => item.product_id && parseInt(item.quantity) > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid product with quantity > 0.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await api.post('/challans', {
        customer_id: parseInt(customerId),
        items: validItems
      });
      navigate(`/challans/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create challan.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <p className="text-muted">Loading dependencies...</p>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Create Sales Challan (DRAFT)</h1>

      {error && <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--card-bg)', borderLeft: '4px solid var(--danger)', borderRadius: '4px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Customer *</label>
          <select 
            value={customerId} 
            onChange={(e) => setCustomerId(e.target.value)} 
            required
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
          >
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.business_name ? `(${c.business_name})` : ''}</option>
            ))}
          </select>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Products</h3>
        
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <select 
                value={item.product_id} 
                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
              >
                <option value="">-- Select Product --</option>
                {products.map(p => {
                  const isLow = p.current_stock <= p.minimum_stock;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} - SKU: {p.sku} (Stock: {p.current_stock}) {isLow ? '⚠️ LOW' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input 
                type="number" 
                min="1" 
                placeholder="Qty"
                value={item.quantity} 
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
              />
            </div>
            
            {items.length > 1 && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => removeItem(index)}
                style={{ height: '42px' }}
              >
                X
              </button>
            )}
          </div>
        ))}
        
        <button 
          type="button" 
          className="btn" 
          onClick={addItem}
          style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', width: '100%', marginBottom: '2rem' }}
        >
          + Add Another Product
        </button>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating Draft...' : 'Save Draft Challan'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/challans')}
            style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
