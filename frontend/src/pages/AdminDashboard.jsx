import { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../api';
import { Card, Button, Spinner, BloodTypeBadge } from '../components/UI';

export default function AdminDashboard({ showToast }) {
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const data = await api.getAdminStats();
        setStats(data);
      } else if (activeTab === 'donors') {
        const data = await api.getAllDonors();
        setDonors(data);
      } else if (activeTab === 'hospitals') {
        const data = await api.getAllHospitals();
        setHospitals(data);
      } else if (activeTab === 'requests') {
        const data = await api.getAllRequests();
        setRequests(data);
      } else if (activeTab === 'donations') {
        const data = await api.getAllDonations();
        setDonations(data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyHospital = async (id) => {
    try {
      await api.verifyHospital(id);
      showToast('Hospital verified!', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteHospital = async (id) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await api.deleteHospital(id);
        showToast('Hospital deleted', 'success');
        loadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleDeleteDonor = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await api.deleteDonor(id);
        showToast('Donor deleted', 'success');
        loadData();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const tabs = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'donors', label: '🩸 Donors' },
    { id: 'hospitals', label: '🏥 Hospitals' },
    { id: 'requests', label: '📋 Requests' },
    { id: 'donations', label: '🎁 Donations' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome, {admin?.fullName || 'Admin'} ({admin?.role || 'Administrator'})
          </p>
        </div>
        <Button variant="ghost" onClick={logout}>Logout</Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: activeTab === tab.id ? '#C0152A' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={40} />
        </div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <Card style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#C0152A' }}>{stats.totalDonors || 0}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total Donors</p>
              </Card>
              <Card style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#C0152A' }}>{stats.totalHospitals || 0}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total Hospitals</p>
              </Card>
              <Card style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#C0152A' }}>{stats.totalRequests || 0}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Blood Requests</p>
              </Card>
              <Card style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#C0152A' }}>{stats.totalDonations || 0}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Donations Completed</p>
              </Card>
              <Card style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ fontSize: 42, fontWeight: 900, color: '#f97316' }}>{stats.pendingRequests || 0}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Pending Requests</p>
              </Card>
            </div>
          )}

          {/* Donors Tab */}
          {activeTab === 'donors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {donors.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No donors found</p>
              ) : (
                donors.map(donor => (
                  <Card key={donor.donorId} style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{donor.fullName}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{donor.email} • {donor.phone}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{donor.cityName} • Total donations: {donor.totalDonations}</p>
                      <BloodTypeBadge type={donor.bloodGroup} size="sm" />
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteDonor(donor.donorId)}>Delete</Button>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Hospitals Tab */}
          {activeTab === 'hospitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hospitals.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No hospitals found</p>
              ) : (
                hospitals.map(hospital => (
                  <Card key={hospital.hospitalId} style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{hospital.hospitalName}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{hospital.email} • {hospital.phone}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{hospital.cityName}</p>
                      <span style={{ fontSize: 12, color: hospital.isVerified ? '#22c55e' : '#f97316', display: 'inline-block', marginTop: 6 }}>
                        {hospital.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!hospital.isVerified && (
                        <Button size="sm" onClick={() => handleVerifyHospital(hospital.hospitalId)}>Verify</Button>
                      )}
                      <Button variant="danger" size="sm" onClick={() => handleDeleteHospital(hospital.hospitalId)}>Delete</Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No requests found</p>
              ) : (
                requests.map(request => (
                  <Card key={request.requestId} style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{request.patientName}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hospital: {request.hospitalName}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{request.cityName} • {request.quantityUnits} units • {request.urgencyLevel}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <BloodTypeBadge type={request.bloodGroup} size="sm" />
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Status: {request.statusName}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {donations.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No donations recorded yet</p>
              ) : (
                donations.map(donation => (
                  <Card key={donation.donationId} style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{donation.donorName}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>to {donation.hospitalName}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{donation.quantityUnits} units • {new Date(donation.donationDate).toLocaleDateString()}</p>
                      </div>
                      <BloodTypeBadge type={donation.bloodGroup} size="sm" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}