import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Welcome, {user?.name}!</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3>Your Role</h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>You are logged in as a <strong>{user?.role}</strong>.</p>
        </div>
        <div className="card">
          <h3>System Status</h3>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Backend connection is healthy.</p>
        </div>
      </div>
    </div>
  );
};
