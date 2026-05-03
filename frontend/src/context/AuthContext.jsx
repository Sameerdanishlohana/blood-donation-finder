import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bl_token');
    if (token) {
      api.getProfile()
        .then(setDonor)
        .catch(() => localStorage.removeItem('bl_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.loginDonor({ email, password });
    localStorage.setItem('bl_token', data.token);
    const profile = await api.getProfile();
    setDonor(profile);
    return profile;
  };

  const register = async (formData) => {
    const data = await api.registerDonor(formData);
    localStorage.setItem('bl_token', data.token);
    const profile = await api.getProfile();
    setDonor(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('bl_token');
    setDonor(null);
  };

  const refreshProfile = async () => {
    const profile = await api.getProfile();
    setDonor(profile);
};

  return (
    <AuthContext.Provider value={{ donor, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
