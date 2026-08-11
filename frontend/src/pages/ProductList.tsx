import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const { user } = useAuth();
  const canEdit = ['ADMIN', 'WAREHOUSE'].includes(user?.role || '');

  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchProducts = async (page: number, query: string, lowStock: boolean) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/products?page=${page}&limit=10&search=${encodeURIComponent(query)}&lowStock=${lowStock}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, search, lowStockOnly);
  }, [currentPage, lowStockOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ page: '1' });
    fetchProducts(1, search, lowStockOnly);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Products</h1>
        {canEdit && <Link to="/products/new" className="btn btn-primary">+ Add Product</Link>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => { setLowStockOnly(e.target.checked); setSearchParams({ page: '1' }); }}
            style={{ width: 'auto' }}
          />
          <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Low Stock Only</span>
        </label>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="text-muted">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No products found.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.current_stock <= p.minimum_stock;
                  return (
                    <tr key={p.id} style={isLow ? { backgroundColor: 'rgba(239, 68, 68, 0.05)' } : {}}>
                      <td style={{ fontWeight: 500 }}>
                        <Link to={`/products/${p.id}`}>{p.name}</Link>
                      </td>
                      <td className="text-muted">{p.sku}</td>
                      <td>{p.category || '—'}</td>
                      <td>₹{p.unit_price.toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: isLow ? 'var(--danger)' : 'var(--secondary)' }}>
                          {p.current_stock}
                        </span>
                        {isLow && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>⚠ LOW</span>}
                      </td>
                      <td>{p.minimum_stock}</td>
                      <td className="text-muted">{p.warehouse_location || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Link to={`/products/${p.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>View</Link>
                          {canEdit && (
                            <Link to={`/products/${p.id}/edit`} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}>Edit</Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" disabled={currentPage <= 1} onClick={() => setSearchParams({ page: String(currentPage - 1) })}>Previous</button>
              <button className="btn btn-primary" disabled={currentPage >= pagination.totalPages} onClick={() => setSearchParams({ page: String(currentPage + 1) })}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
