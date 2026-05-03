import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Input, Select, Button, Card } from '../components/UI';

export default function Register({ setPage, showToast }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
    blood_group_id: '', city_id: '', date_of_birth: '', gender: '',
  });

  useEffect(() => {
    Promise.all([api.getBloodGroups(), api.getCities()])
      .then(([bg, c]) => { setBloodGroups(bg); setCities(c); })
      .catch(() => showToast('Failed to load options', 'error'));
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validateStep1 = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.blood_group_id) e.blood_group_id = 'Select your blood type';
    if (!form.city_id) e.city_id = 'Select your city';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        blood_group_id: parseInt(form.blood_group_id),
        city_id: parseInt(form.city_id),
      });
      showToast('Welcome to BloodLink! Your account is ready.', 'success');
      setPage('profile');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Account Details', 'Blood & Location'];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 6 }}>
          Join BloodLink
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Register as a donor and start saving lives.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {stepLabels.map((label, i) => (
          <div key={label} style={{
            flex: 1, padding: '12px 16px', textAlign: 'center',
            background: step === i + 1 ? '#C0152A' : 'transparent',
            borderRight: i === 0 ? '1px solid var(--border)' : 'none',
            transition: 'background 0.2s',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: step === i + 1 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Step {i + 1}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: step === i + 1 ? '#fff' : 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <Card style={{ padding: '32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Full Name" placeholder="e.g. Ahmed Raza" value={form.full_name} onChange={e => set('full_name', e.target.value)} error={errors.full_name} />
            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
            <Input label="Phone Number" placeholder="03XX-XXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
            <Input label="Password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} />
            <Input label="Confirm Password" type="password" placeholder="Re-enter your password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} error={errors.confirm_password} />
            <Button fullWidth size="lg" style={{ marginTop: 8 }} onClick={() => validateStep1() && setStep(2)}>
              Continue →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Select label="Blood Type" value={form.blood_group_id} onChange={e => set('blood_group_id', e.target.value)} error={errors.blood_group_id}>
              <option value="">Select your blood type</option>
              {bloodGroups.map(bg => (
                <option key={bg.bloodGroupId} value={bg.bloodGroupId}>{bg.bloodType}</option>
              ))}
            </Select>

            <Select label="City" value={form.city_id} onChange={e => set('city_id', e.target.value)} error={errors.city_id}>
              <option value="">Select your city</option>
              {cities.map(c => (
                <option key={c.cityId} value={c.cityId}>{c.cityName}{c.province ? ` — ${c.province}` : ''}</option>
              ))}
            </Select>

            <Select label="Gender (optional)" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>

            <Input label="Date of Birth (optional)" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Button variant="ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</Button>
              <Button style={{ flex: 2 }} size="lg" loading={loading} onClick={handleSubmit}>
                Create Account
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: '#C0152A', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13 }}>
          Sign in
        </button>
      </p>
    </div>
  );
}
