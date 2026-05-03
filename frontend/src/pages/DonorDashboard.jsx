import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Card, Button, BloodTypeBadge, Spinner } from '../components/UI';

export default function DonorDashboard({ showToast }) {
  const { donor, logout, refreshProfile } = useAuth();
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    if (donor) {
      loadDashboardData();
    }
  }, [donor]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load emergency requests
      const requests = await api.getEmergencyRequests();
      setEmergencyRequests(requests || []);
      
      // Load donation history (confirmed donations)
      const history = await api.getDonationHistory();
      setDonationHistory(history || []);
      
      // Load pending donations (responses waiting for hospital confirmation)
      const pending = await api.getPendingDonations();
      setPendingDonations(pending || []);
      
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId) => {
    setResponding(requestId);
    try {
      const result = await api.respondToEmergencyRequest(requestId);
      showToast('Response sent! Donation recorded. Hospital will contact you.', 'success');
      
      // Refresh all data
      await loadDashboardData();
      
      // Also refresh the auth context to update donor stats
      await refreshProfile();
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResponding(null);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await api.updateAvailability(!donor.isAvailable);
      await refreshProfile();
      showToast(`You are now ${!donor.isAvailable ? 'available' : 'unavailable'} to donate`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={40} />
      </div>
    );
  }

  const totalLivesSaved = (donor?.totalDonations || 0) * 3;

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900 }}>
          Welcome, {donor?.fullName}!
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Your donor dashboard - track requests and manage your profile</p>
      </div>

      {/* Donor Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#C0152A' }}>{donor?.totalDonations || 0}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Donations</p>
        </Card>
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#C0152A' }}>{totalLivesSaved}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lives Saved</p>
        </Card>
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: donor?.isAvailable ? '#22c55e' : '#ef4444' }} />
            <p style={{ fontSize: 20, fontWeight: 700, color: donor?.isAvailable ? '#22c55e' : '#ef4444' }}>
              {donor?.isAvailable ? 'Available' : 'Unavailable'}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleToggleAvailability}>
            {donor?.isAvailable ? 'Set Unavailable' : 'Set Available'}
          </Button>
        </Card>
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <BloodTypeBadge type={donor?.bloodGroup} size="lg" />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Your Blood Type</p>
        </Card>
      </div>

      {/* Pending Donations Section */}
      {pendingDonations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#f97316' }}>
            ⏳ Pending Donations (Awaiting Hospital Confirmation)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingDonations.map(donation => (
              <Card key={donation.donationId} style={{ padding: 20, borderLeft: '4px solid #f97316' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                      <BloodTypeBadge type={donation.bloodGroup} size="sm" />
                      <span style={{ padding: '4px 10px', borderRadius: 16, background: '#f97316', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                        Pending Confirmation
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{donation.patientName}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{donation.hospitalName} • {donation.cityName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Responded: {new Date(donation.donationDate).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>{donation.quantityUnits} unit(s)</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for hospital to confirm</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Requests Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>🆘 Emergency Requests Near You</h2>
          <Button variant="ghost" size="sm" onClick={loadDashboardData}>Refresh</Button>
        </div>

        {emergencyRequests.length === 0 ? (
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No emergency requests matching your blood type and location.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Check back later or expand your location.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {emergencyRequests.slice(0, 5).map(req => (
              <Card key={req.requestId} style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                      <BloodTypeBadge type={req.bloodGroup} size="sm" />
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 16,
                        background: req.urgencyLevel === 'Emergency' ? '#dc2626' : req.urgencyLevel === 'High' ? '#f97316' : '#22c55e',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                      }}>{req.urgencyLevel}</span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Patient: {req.patientName}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{req.hospitalName} • {req.cityName}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Need {req.quantityUnits} unit(s)</p>
                  </div>
                  <Button 
                    onClick={() => handleRespond(req.requestId)} 
                    loading={responding === req.requestId}
                    disabled={!donor?.isAvailable}
                  >
                    {!donor?.isAvailable ? '🔴 Set Available First' : '🤝 I Can Help - Donate Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Donations History */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📜 Your Completed Donations</h2>
        {donationHistory.length === 0 ? (
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No completed donations yet.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>When you donate and hospital confirms, it will appear here.</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {donationHistory.slice(0, 3).map((donation, idx) => (
              <Card key={idx} style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{donation.hospitalName}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#C0152A' }}>{donation.quantityUnits} unit(s)</p>
                    <p style={{ fontSize: 12, color: '#22c55e' }}>✓ Confirmed</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <Button onClick={() => window.location.href = '#donor-profile'}>View Full Profile</Button>
        <Button variant="secondary" onClick={() => window.location.href = '#donor-history'}>View All History</Button>
        <Button variant="ghost" onClick={logout}>Sign Out</Button>
      </div>
    </div>
  );
}