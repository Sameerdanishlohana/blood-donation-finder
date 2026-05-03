import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalAuthProvider, useHospitalAuth } from './context/HospitalAuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Sidebar from './components/Sidebar';
import { Toast, Spinner } from './components/UI';

// Import all pages
import Landing from './pages/Landing';
import DonorLogin from './pages/Login';
import DonorRegister from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/Profile';
import DonorHistory from './pages/DonorHistory';
import HospitalLogin from './pages/HospitalLogin';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import DonorRequests from './pages/DonorRequests';

const globalCSS = `... (keep your existing CSS) ...`;

function AppInner() {
  const { donor, loading: donorLoading } = useAuth();
  const { hospital, loading: hospitalLoading } = useHospitalAuth();
  const { admin, loading: adminLoading } = useAdminAuth();
  const [page, setPage] = useState('landing');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '' }), 4000);
  };

  const loading = donorLoading || hospitalLoading || adminLoading;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F0407' }}>
        <Spinner size={40} color="#C0152A" />
      </div>
    );
  }

  const pageProps = { setPage, showToast };

  // Landing Page - No Sidebar
  if (page === 'landing') {
    return (
      <>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <Landing {...pageProps} />
        </main>
      </>
    );
  }

  // Donor Pages
  const donorPages = {
    'donor-login': <DonorLogin {...pageProps} />,
    'donor-register': <DonorRegister {...pageProps} />,
    'donor-dashboard': donor ? <DonorDashboard {...pageProps} /> : <DonorLogin {...pageProps} />,
    'donor-profile': donor ? <DonorProfile {...pageProps} /> : <DonorLogin {...pageProps} />,
    'donor-history': donor ? <DonorHistory {...pageProps} /> : <DonorLogin {...pageProps} />,
    'donor-requests': donor ? <DonorRequests {...pageProps} /> : <DonorLogin {...pageProps} />,
    search: <Search {...pageProps} />,
  };

  // Hospital Pages
  if (page === 'hospital-login') {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ marginLeft: 260, flex: 1, padding: '44px', minHeight: '100vh' }}>
          <HospitalLogin setPage={setPage} showToast={showToast} />
        </main>
      </div>
    );
  }

  if (page === 'hospital-dashboard') {
    if (!hospital) {
      setPage('hospital-login');
      return null;
    }
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ marginLeft: 260, flex: 1, padding: '44px', minHeight: '100vh' }}>
          <HospitalDashboard showToast={showToast} />
        </main>
      </div>
    );
  }

  // Admin Pages
  if (page === 'admin-login') {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ marginLeft: 260, flex: 1, padding: '44px', minHeight: '100vh' }}>
          <AdminLogin setPage={setPage} showToast={showToast} />
        </main>
      </div>
    );
  }

  if (page === 'admin-dashboard') {
    if (!admin) {
      setPage('admin-login');
      return null;
    }
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ marginLeft: 260, flex: 1, padding: '44px', minHeight: '100vh' }}>
          <AdminDashboard showToast={showToast} />
        </main>
      </div>
    );
  }

  // Default - Show sidebar for donor pages
  return (
    <div style={{ display: 'flex' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />
      <Sidebar page={page} setPage={setPage} />
      <main style={{ marginLeft: 260, flex: 1, padding: '44px 44px 64px', minHeight: '100vh' }}>
        {donorPages[page] || <Landing {...pageProps} />}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCSS;
    document.head.appendChild(style);
  }, []);

  return (
    <AuthProvider>
      <HospitalAuthProvider>
        <AdminAuthProvider>
          <AppInner />
        </AdminAuthProvider>
      </HospitalAuthProvider>
    </AuthProvider>
  );
}