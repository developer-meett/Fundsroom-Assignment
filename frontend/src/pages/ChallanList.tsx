import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export const ChallanList = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchChallans = async (page: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/challans?page=${page}&limit=10`);
      setChallans(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(currentPage);
  }, [currentPage]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Sales Challans</h1>
        <Link to="/challans/new" className="btn btn-primary">+ Create Challan</Link>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="text-muted">Loading challans...</p>
      ) : challans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No challans found. Create your first challan!</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/challans/${c.id}`}>{c.challan_number}</Link>
                    </td>
                    <td>{c.customer?.name || '—'}</td>
                    <td>{c.total_quantity}</td>
                    <td>
                      <span className={`status-badge status-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-muted">{c.user?.name || '—'}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/challans/${c.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>View</Link>
                    </td>
                  </tr>
                ))}
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
