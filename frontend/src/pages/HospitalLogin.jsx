import { useState, useEffect } from 'react';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import { Input, Button, Card, Select } from '../components/UI';
import { api } from '../api';

export default function HospitalLogin({ setPage, showToast }) {
  const { login, register } = useHospitalAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    hospital_name: '', 
    license_number: '', 
    phone: '', 
    address: '', 
    city_id: '' 
  });

  useEffect(() => {
    // Load cities for the dropdown
    api.getCities()
      .then(setCities)
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isRegister) {
        if (!form.hospital_name || !form.license_number || !form.email || !form.password || !form.phone || !form.address || !form.city_id) {
          showToast('All fields are required', 'error');
          setLoading(false);
          return;
        }
        await register(form);
        showToast('Registration successful! Awaiting admin verification.', 'success');
        setIsRegister(false);
        setForm({ email: '', password: '', hospital_name: '', license_number: '', phone: '', address: '', city_id: '' });
      } else {
        if (!form.email || !form.password) {
          showToast('Email and password required', 'error');
          setLoading(false);
          return;
        }
        await login(form.email, form.password);
        showToast('Login successful!', 'success');
        setPage('hospital-dashboard');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 550, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
          {isRegister ? 'Hospital Registration' : 'Hospital Login'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isRegister ? 'Register your hospital to request blood' : 'Access your hospital dashboard'}
        </p>
      </div>
      
      <Card style={{ padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input 
            label="Email" 
            type="email"
            placeholder="hospital@example.com"
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••"
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          
          {isRegister && (
            <>
              <Input 
                label="Hospital Name" 
                placeholder="City Hospital"
                value={form.hospital_name} 
                onChange={e => setForm({ ...form, hospital_name: e.target.value })} 
              />
              <Input 
                label="License Number" 
                placeholder="LIC-12345"
                value={form.license_number} 
                onChange={e => setForm({ ...form, license_number: e.target.value })} 
              />
              <Input 
                label="Phone" 
                placeholder="021-12345678"
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
              />
              <Input 
                label="Address" 
                placeholder="Street, City Area"
                value={form.address} 
                onChange={e => setForm({ ...form, address: e.target.value })} 
              />
              
              <Select 
                label="City"
                value={form.city_id}
                onChange={e => setForm({ ...form, city_id: e.target.value })}
              >
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city.cityId} value={city.cityId}>
                    {city.cityName} {city.province ? `- ${city.province}` : ''}
                  </option>
                ))}
              </Select>
              
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
                After registration, an admin must verify your account before you can log in.
              </p>
            </>
          )}
          
          <Button loading={loading} onClick={handleSubmit} fullWidth size="lg">
            {isRegister ? 'Register Hospital' : 'Login →'}
          </Button>
          
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setForm({ email: '', password: '', hospital_name: '', license_number: '', phone: '', address: '', city_id: '' });
            }} 
            style={{ background: 'none', border: 'none', color: '#C0152A', cursor: 'pointer', marginTop: 8, fontSize: 14 }}
          >
            {isRegister ? '← Back to Login' : 'New hospital? Register here'}
          </button>
        </div>
      </Card>
    </div>
  );
}