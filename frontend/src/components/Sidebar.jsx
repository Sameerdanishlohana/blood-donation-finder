import { useAuth } from '../context/AuthContext';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const NAV = [
  { id: 'donor-dashboard', label: '🏠 Dashboard', icon: '⌂', donorOnly: true },
  { id: 'donor-requests', label: '🆘 Emergency Requests', icon: '!', donorOnly: true },
  { id: 'search', label: '🔍 Find Donors', icon: '⊕', public: true },
  { id: 'donor-profile', label: '👤 My Profile', icon: '◈', donorOnly: true },
  { id: 'donor-history', label: '📜 Donation History', icon: 'H', donorOnly: true },
  { id: 'donor-login', label: '🔑 Donor Login', icon: '→', guestOnly: true },
  { id: 'donor-register', label: '📝 Donor Register', icon: '✦', guestOnly: true },
  { id: 'hospital-login', label: '🏥 Hospital Portal', icon: 'H', public: true },
  { id: 'admin-login', label: '👑 Admin Portal', icon: 'A', public: true },
];

export default function Sidebar({ page, setPage }) {
  const { donor, logout: donorLogout } = useAuth();
  const { hospital, logout: hospitalLogout } = useHospitalAuth();
  const { admin, logout: adminLogout } = useAdminAuth();

  const isDonorLoggedIn = !!donor;
  const isHospitalLoggedIn = !!hospital;
  const isAdminLoggedIn = !!admin;

  const handleLogout = () => {
    if (isDonorLoggedIn) donorLogout();
    if (isHospitalLoggedIn) hospitalLogout();
    if (isAdminLoggedIn) adminLogout();
    setPage('home');
  };

  const navItems = NAV.filter(n => {
    if (n.donorOnly && !isDonorLoggedIn) return false;
    if (n.guestOnly && isDonorLoggedIn) return false;
    return true;
  });

  return (
    <aside style={{
      width: 260, minHeight: '100vh', background: '#0F0407',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100,
      borderRight: '1px solid rgba(192,21,42,0.15)',
    }}>
      <div style={{ padding: '32px 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 32 }}>🩸</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>
            Blood<span style={{ color: '#E8293E' }}>Link</span>
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: 2 }}>Pakistan Donor Network</p>
      </div>

      <nav style={{ padding: '20px 12px', flex: 1 }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, marginBottom: 2,
              background: active ? 'rgba(192,21,42,0.2)' : 'transparent',
              color: active ? '#FF8090' : 'rgba(255,255,255,0.45)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderLeft: active ? '2px solid #C0152A' : '2px solid transparent',
            }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {isDonorLoggedIn && (
          <div>
            <div style={{ background: 'rgba(192,21,42,0.12)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{donor.fullName}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{donor.bloodGroup} • {donor.cityName}</p>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
          </div>
        )}
        {isHospitalLoggedIn && (
          <div>
            <div style={{ background: 'rgba(192,21,42,0.12)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{hospital.hospitalName}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Hospital Portal</p>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
          </div>
        )}
        {isAdminLoggedIn && (
          <div>
            <div style={{ background: 'rgba(192,21,42,0.12)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{admin.fullName}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Admin Portal</p>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
          </div>
        )}
        {!isDonorLoggedIn && !isHospitalLoggedIn && !isAdminLoggedIn && (
          <div style={{ background: 'rgba(192,21,42,0.15)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <p style={{ color: '#FF8090', fontSize: 12, fontWeight: 600 }}>Emergency</p>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>1122</p>
          </div>
        )}
      </div>
    </aside>
  );
}