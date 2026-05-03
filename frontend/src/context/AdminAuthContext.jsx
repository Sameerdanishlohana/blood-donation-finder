import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_data');
    
    if (token && savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        setAdmin(adminData);
        
        // Verify token is still valid
        api.getAdminStats().catch(() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          setAdmin(null);
        });
      } catch (e) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.loginAdmin({ email, password });
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_data', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};