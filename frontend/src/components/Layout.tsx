import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">Mini ERP</div>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
          
          {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '') && (
            <Link to="/customers" className={`nav-link ${location.pathname.startsWith('/customers') ? 'active' : ''}`}>Customers</Link>
          )}
          
          <Link to="/products" className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`}>Products</Link>
          
          {['ADMIN', 'WAREHOUSE'].includes(user?.role || '') && (
            <Link to="/inventory" className={`nav-link ${location.pathname.startsWith('/inventory') ? 'active' : ''}`}>Inventory / Stock</Link>
          )}
          
          <Link to="/challans" className={`nav-link ${location.pathname.startsWith('/challans') ? 'active' : ''}`}>Sales Challans</Link>
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>{user?.name}</div>
          <div className="role-badge" style={{ marginBottom: '1rem' }}>{user?.role}</div>
          <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).toUpperCase()}</h2>
        </header>
        <div className="content-area"><Outlet /></div>
      </main>
    </div>
  );
};
