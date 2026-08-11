import { useState, useEffect } from 'react';
import api from '../api/axios';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    challans: 0
  });
  
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats using pagination metadata to avoid downloading all rows
        const [customersRes, productsRes, lowStockRes, challansRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/products?limit=1'),
          api.get('/products?lowStock=true&limit=5'),
          api.get('/challans?limit=5')
        ]);
        
        setStats({
          customers: customersRes.data.pagination.total,
          products: productsRes.data.pagination.total,
          lowStock: lowStockRes.data.pagination.total,
          challans: challansRes.data.pagination.total
        });
        
        setLowStockProducts(lowStockRes.data.data);
        setRecentChallans(challansRes.data.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-title">Total Customers</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-title">Total Products</div>
          <div className="stat-value">{stats.products}</div>
        </div>
        
        <div className="card stat-card" style={{ borderLeft: stats.lowStock > 0 ? '4px solid var(--danger)' : '' }}>
          <div className="stat-title">Low Stock Items</div>
          <div className="stat-value" style={{ color: stats.lowStock > 0 ? 'var(--danger)' : 'inherit' }}>
            {stats.lowStock}
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-title">Total Challans</div>
          <div className="stat-value">{stats.challans}</div>
        </div>
      </div>
      
      {/* Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Challans */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Recent Challans
          </h3>
          {recentChallans.length === 0 ? (
            <p className="text-muted">No challans found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.map(challan => (
                  <tr key={challan.id}>
                    <td style={{ fontWeight: 500 }}>{challan.challan_number}</td>
                    <td>{challan.customer?.name}</td>
                    <td>
                      <span className={`status-badge status-${challan.status.toLowerCase()}`}>
                        {challan.status}
                      </span>
                    </td>
                    <td>{new Date(challan.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Low Stock Products */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Low Stock Alerts</span>
            {stats.lowStock > 0 && <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Action required</span>}
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-muted">All products are sufficiently stocked.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Min</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td className="text-muted">{product.sku}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{product.current_stock}</td>
                    <td>{product.minimum_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
      </div>
    </div>
  );
};
