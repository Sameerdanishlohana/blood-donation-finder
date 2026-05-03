import { useState, useEffect } from 'react';

export default function Landing({ setPage, showToast }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    setStats({
      donors: '1,200+',
      hospitals: '50+',
      donations: '4,800+',
      cities: '24'
    });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0407 0%, #1a0609 50%, #0F0407 100%)',
        borderRadius: 24,
        padding: '64px 56px',
        marginBottom: 32,
        textAlign: 'center',
        border: '1px solid rgba(192,21,42,0.2)',
      }}>
        <span style={{ display: 'inline-block', fontSize: 72, marginBottom: 16 }}>🩸</span>
        <h1 style={{
          fontFamily: 'system-ui',
          fontSize: 56,
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Blood Donation &<br />
          <span style={{ color: '#C0152A' }}>Emergency Finder</span>
        </h1>
        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.6)',
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Connect donors with emergency blood requests instantly.
          Save lives by donating blood to those in need.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 48,
      }}>
        {[
          { label: 'Registered Donors', value: stats.donors },
          { label: 'Partner Hospitals', value: stats.hospitals },
          { label: 'Lives Saved', value: stats.donations },
          { label: 'Cities Covered', value: stats.cities },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff',
            borderRadius: 16,
            padding: 28,
            textAlign: 'center',
            border: '1px solid #eee',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 36, fontWeight: 900, color: '#C0152A' }}>{stat.value}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Role Selection Cards */}
      <h2 style={{
        fontSize: 28,
        fontWeight: 800,
        marginBottom: 24,
        textAlign: 'center',
      }}>
        Select Your Role
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 48,
      }}>
        {/* Donor Card */}
        <div 
          onClick={() => setPage('donor-login')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            border: '1px solid #eee',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🩸</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>I'm a Donor</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              Register as a blood donor, find emergency requests, and save lives.
              Track your donation history and manage your availability.
            </p>
            <button style={{
              marginTop: 24,
              width: '100%',
              padding: '12px 24px',
              background: '#C0152A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Donor Portal →
            </button>
          </div>
        </div>

        {/* Hospital Card */}
        <div 
          onClick={() => setPage('hospital-login')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            border: '1px solid #eee',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Hospital / Requester</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              Create emergency blood requests, search for matching donors,
              and manage patient information. Get verified by admin.
            </p>
            <button style={{
              marginTop: 24,
              width: '100%',
              padding: '12px 24px',
              background: '#C0152A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Hospital Portal →
            </button>
          </div>
        </div>

        {/* Admin Card */}
        <div 
          onClick={() => setPage('admin-login')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            border: '1px solid #eee',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Administrator</h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              Manage donors, hospitals, requests, and donations.
              Verify hospitals and maintain system integrity.
            </p>
            <button style={{
              marginTop: 24,
              width: '100%',
              padding: '12px 24px',
              background: '#C0152A',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Admin Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}