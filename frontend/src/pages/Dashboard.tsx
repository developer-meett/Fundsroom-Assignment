import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({ customers: 0, products: 0, lowStock: 0, challans: 0 });
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // API logic to be implemented
    setLoading(false);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return <div><h1 style={{ marginBottom: '2rem' }}>Dashboard</h1><p>KPIs loading...</p></div>;
};
