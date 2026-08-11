import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

interface User { id: number; name: string; email: string; role: string; }
interface AuthContextType { user: User | null; loading: boolean; login: (user: User, token?: string) => void; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (error) { console.error(error); } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
