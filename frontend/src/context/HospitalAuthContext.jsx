import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const HospitalAuthContext = createContext(null);

export function HospitalAuthProvider({ children }) {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hospital_token');
    if (token) {
      // Try to get hospital profile
      api.getHospitalProfile()
        .then(setHospital)
        .catch(() => {
          localStorage.removeItem('hospital_token');
          setHospital(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.loginHospital({ email, password });
    localStorage.setItem('hospital_token', data.token);
    setHospital(data.hospital);
    return data.hospital;
  };

  const register = async (formData) => {
    const data = await api.registerHospital(formData);
    localStorage.setItem('hospital_token', data.token);
    setHospital(data.hospital);
    return data.hospital;
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    setHospital(null);
  };

  const refreshProfile = async () => {
    const profile = await api.getHospitalProfile();
    setHospital(profile);
  };

  return (
    <HospitalAuthContext.Provider value={{ hospital, loading, login, register, logout, refreshProfile }}>
      {children}
    </HospitalAuthContext.Provider>
  );
}

export const useHospitalAuth = () => {
  const context = useContext(HospitalAuthContext);
  if (!context) {
    throw new Error('useHospitalAuth must be used within HospitalAuthProvider');
  }
  return context;
};