import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const CustomerList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const { user } = useAuth();
  const canEdit = ['ADMIN', 'SALES'].includes(user?.role || '');

  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchCustomers = async (page: number, query: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/customers?page=${page}&limit=10&search=${encodeURIComponent(query)}`);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load customers.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, search);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ page: '1' });
    fetchCustomers(1, search);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Customers</h1>
        {canEdit && <Link to="/customers/new" className="btn btn-primary">+ Add Customer</Link>}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name, email, mobile, or business..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="text-muted">Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No customers found.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>
                      <Link to={`/customers/${c.id}`}>{c.name}</Link>
                    </td>
                    <td>{c.business_name || '—'}</td>
                    <td>{c.mobile}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.customer_type || '—'}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'ACTIVE' ? 'status-confirmed' : 'status-cancelled'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : '—'}</td>
                    <td>
                      {canEdit ? (
                        <Link to={`/customers/${c.id}/edit`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Edit</Link>
                      ) : (
                        <Link to={`/customers/${c.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>View</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                disabled={currentPage <= 1}
                onClick={() => setSearchParams({ page: String(currentPage - 1) })}
              >
                Previous
              </button>
              <button
                className="btn btn-primary"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setSearchParams({ page: String(currentPage + 1) })}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
