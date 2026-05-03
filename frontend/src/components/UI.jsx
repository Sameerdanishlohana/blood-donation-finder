import { useState } from 'react';

export function Toast({ message, type, onClose }) {
  if (!message) return null;
  const bg = type === 'error' ? '#7f1d1d' : '#14532d';
  const border = type === 'error' ? '#ef4444' : '#22c55e';
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: bg, border: `1px solid ${border}`,
      color: '#fff', padding: '14px 20px', borderRadius: 12,
      fontSize: 14, fontWeight: 500, maxWidth: 360,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideIn 0.2s ease',
    }}>
      <span style={{ fontSize: 18 }}>{type === 'error' ? '✕' : '✓'}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
    </div>
  );
}

export function Spinner({ size = 20, color = '#C0152A' }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid rgba(192,21,42,0.2)`,
      borderTop: `2px solid ${color}`, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

export function BloodTypeBadge({ type, size = 'md' }) {
  const palettes = {
    'O+': '#C0152A', 'O-': '#7f1d1d', 'A+': '#b91c1c', 'A-': '#991b1b',
    'B+': '#c2410c', 'B-': '#9a3412', 'AB+': '#7e22ce', 'AB-': '#6b21a8',
  };
  const bg = palettes[type] || '#C0152A';
  const pad = size === 'lg' ? '10px 18px' : '4px 12px';
  const fs = size === 'lg' ? 18 : 13;
  return (
    <span style={{
      background: bg, color: '#fff', padding: pad,
      borderRadius: 8, fontSize: fs, fontWeight: 700,
      fontFamily: 'var(--font-display)', letterSpacing: 0.5, flexShrink: 0,
    }}>{type}</span>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</label>}
      <input {...props} style={{
        padding: '11px 14px', borderRadius: 8, fontSize: 14,
        border: error ? '1px solid #ef4444' : '1px solid var(--border)',
        background: 'var(--input-bg)', color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)', width: '100%',
        transition: 'border-color 0.15s',
        ...props.style,
      }} />
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</label>}
      <select {...props} style={{
        padding: '11px 14px', borderRadius: 8, fontSize: 14,
        border: error ? '1px solid #ef4444' : '1px solid var(--border)',
        background: 'var(--input-bg)', color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)', width: '100%',
        cursor: 'pointer',
        ...props.style,
      }}>
        {children}
      </select>
      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  );
}

export function Button({ children, variant = 'primary', loading, fullWidth, size = 'md', onClick, disabled, style, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 8, fontFamily: 'var(--font-body)',
    fontWeight: 600, cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', border: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: loading || disabled ? 0.7 : 1,
    fontSize: size === 'sm' ? 13 : 14,
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '11px 22px',
  };
  const variants = {
    primary: { background: '#C0152A', color: '#fff' },
    secondary: { background: 'transparent', color: '#C0152A', border: '1px solid #C0152A' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
    danger: { background: '#7f1d1d', color: '#fff' },
  };
  return (
    <button 
      onClick={onClick} 
      disabled={loading || disabled} 
      style={{ ...base, ...variants[variant], ...style }} 
      {...props}
    >
      {loading && <Spinner size={16} color={variant === 'primary' ? '#fff' : '#C0152A'} />}
      {children}
    </button>
  );
}

export function Card({ children, style, hover, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        boxShadow: hovered ? '0 8px 32px rgba(192,21,42,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AvailabilityToggle({ isAvailable, onChange, loading }) {
  return (
    <button
      onClick={() => onChange(!isAvailable)}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
        transition: 'all 0.2s', width: '100%',
      }}
    >
      <div style={{
        width: 38, height: 22, borderRadius: 11,
        background: isAvailable ? '#22c55e' : '#ef4444',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: isAvailable ? 18 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </div>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: isAvailable ? '#16a34a' : '#dc2626',
      }}>
        {loading ? 'Updating...' : isAvailable ? 'Available to Donate' : 'Not Available'}
      </span>
    </button>
  );
}