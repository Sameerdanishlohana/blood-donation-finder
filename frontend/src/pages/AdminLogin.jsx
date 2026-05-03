import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Input, Button, Card } from '../components/UI';

export default function AdminLogin({ setPage, showToast }) {
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      showToast('Email and password required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome to Admin Portal!', 'success');
      setPage('admin-dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900 }}>Admin Login</h1>
        <p style={{ color: 'var(--text-muted)' }}>Secure access to administrative controls</p>
      </div>
      
      <Card style={{ padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input 
            label="Email" 
            placeholder="admin@bloodfinder.com"
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••"
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <Button loading={loading} onClick={handleLogin} fullWidth>
            Login → 
          </Button>
        </div>
      </Card>
      
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        Default: admin@bloodfinder.com / admin123
      </p>
    </div>
  );
}