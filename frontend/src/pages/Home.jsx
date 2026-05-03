export default function Home({ setPage }) {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0407 0%, #1a0609 50%, #0F0407 100%)',
        borderRadius: 20, padding: '64px 56px', marginBottom: 28,
        border: '1px solid rgba(192,21,42,0.2)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,21,42,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 100, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,21,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(192,21,42,0.2)',
            color: '#FF8090', fontSize: 12, fontWeight: 600, letterSpacing: 2,
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 20,
            border: '1px solid rgba(192,21,42,0.3)', marginBottom: 20,
          }}>Pakistan's Blood Donation Network</span>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900,
            color: '#fff', lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: 20,
          }}>
            Every drop<br />
            <span style={{ color: '#C0152A' }}>saves a life.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.7, maxWidth: 480, marginBottom: 36 }}>
            Connect with blood donors across Pakistan instantly. Search by blood type and city — find a match in seconds.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setPage('search')} style={{
              background: '#C0152A', color: '#fff', padding: '14px 28px',
              borderRadius: 10, fontFamily: 'var(--font-body)', fontWeight: 700,
              fontSize: 15, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(192,21,42,0.4)',
            }}>
              Find a Donor →
            </button>
            <button onClick={() => setPage('register')} style={{
              background: 'transparent', color: '#fff', padding: '14px 28px',
              borderRadius: 10, fontFamily: 'var(--font-body)', fontWeight: 600,
              fontSize: 15, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
            }}>
              Become a Donor
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Registered Donors', value: '1,200+', sub: 'and growing daily' },
          { label: 'Cities Covered', value: '24', sub: 'across Pakistan' },
          { label: 'Lives Connected', value: '4,800+', sub: 'donations facilitated' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface-card)', borderRadius: 16, padding: '28px 24px',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: '#C0152A', lineHeight: 1, marginBottom: 6 }}>{s.value}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Blood type guide */}
      <div style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Blood Type Compatibility</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Who can donate to whom</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {[
            { type: 'O-', canDonateTo: 'All types', bg: '#7f1d1d' },
            { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', bg: '#991b1b' },
            { type: 'A-', canDonateTo: 'A-, A+, AB-, AB+', bg: '#b91c1c' },
            { type: 'A+', canDonateTo: 'A+, AB+', bg: '#c2410c' },
            { type: 'B-', canDonateTo: 'B-, B+, AB-, AB+', bg: '#9a3412' },
            { type: 'B+', canDonateTo: 'B+, AB+', bg: '#c2410c' },
            { type: 'AB-', canDonateTo: 'AB-, AB+', bg: '#7c3aed' },
            { type: 'AB+', canDonateTo: 'AB+ only', bg: '#6d28d9' },
          ].map((item, i) => (
            <div key={item.type} style={{
              padding: '20px', borderRight: i % 4 !== 3 ? '1px solid var(--border)' : 'none',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                display: 'inline-block', background: item.bg, color: '#fff',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                padding: '6px 14px', borderRadius: 8, marginBottom: 10,
              }}>{item.type}</span>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>Donates to</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{item.canDonateTo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
