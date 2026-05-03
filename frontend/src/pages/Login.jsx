import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components/UI';

export default function Login({ setPage, showToast }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const handleLogin = async () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.password) e.password = 'Password is required';
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
      setPage('profile');
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '0 auto' }}>
      {/* Hero text */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: 'rgba(192,21,42,0.1)',
          border: '1px solid rgba(192,21,42,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24, marginBottom: 20,
        }}>🩸</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 6 }}>
          Sign in
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Access your donor profile and manage your availability.</p>
      </div>

      <Card style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={errors.email}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            error={errors.password}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <Button fullWidth size="lg" loading={loading} onClick={handleLogin} style={{ marginTop: 8 }}>
            Sign In →
          </Button>
        </div>
      </Card>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        Not registered yet?{' '}
        <button onClick={() => setPage('register')} style={{ background: 'none', border: 'none', color: '#C0152A', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13 }}>
          Create an account
        </button>
      </p>
    </div>
  );
}
