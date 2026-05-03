import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Card, Button, BloodTypeBadge, Spinner } from '../components/UI';

export default function DonorRequests({ showToast }) {
  const { donor } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (donor) {
      loadRequests();
    }
  }, [donor]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching emergency requests...');
      const data = await api.getEmergencyRequests();
      console.log('Received requests:', data);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message);
      showToast(err.message || 'Could not load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId) => {
    setResponding(requestId);
    try {
      await api.respondToEmergencyRequest(requestId);
      showToast('Response sent! Hospital will contact you soon.', 'success');
      loadRequests(); // Refresh the list
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResponding(null);
    }
  };

  const getUrgencyColor = (level) => {
    if (level === 'Emergency') return { bg: '#dc2626', text: '🚨 EMERGENCY' };
    if (level === 'High') return { bg: '#f97316', text: '⚠️ HIGH PRIORITY' };
    return { bg: '#22c55e', text: '🟢 NORMAL' };
  };

  if (!donor) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p>Please login to view emergency requests.</p>
        <Button onClick={() => window.location.href = '#donor-login'}>Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
          🆘 Emergency Blood Requests
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Showing requests matching your blood type ({donor?.bloodGroup}) and city ({donor?.cityName})
        </p>
      </div>

      {error && (
        <Card style={{ padding: 20, marginBottom: 20, background: '#7f1d1d', color: '#fff' }}>
          <p>Error: {error}</p>
          <Button variant="ghost" onClick={loadRequests}>Retry</Button>
        </Card>
      )}

      {requests.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>🩸</span>
          <p style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: 'var(--text-primary)' }}>
            No active requests
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            There are no emergency requests matching your blood type ({donor?.bloodGroup}) and city ({donor?.cityName}) at this time.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Check back later or update your availability status.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(req => {
            const urgency = getUrgencyColor(req.urgencyLevel);
            return (
              <Card key={req.requestId} style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                      <BloodTypeBadge type={req.bloodGroup} size="lg" />
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        background: urgency.bg, 
                        color: '#fff', 
                        fontSize: 12, 
                        fontWeight: 600 
                      }}>
                        {urgency.text}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        📦 {req.quantityUnits} unit(s) needed
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                      Patient: {req.patientName}
                    </h3>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
                      🏥 {req.hospitalName} • 📍 {req.cityName}
                    </p>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      📞 Hospital Contact: {req.contactPerson || 'Hospital Staff'} {req.contactPhone ? `(${req.contactPhone})` : ''}
                    </p>
                    
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      Requested: {new Date(req.requestedDate).toLocaleDateString()}
                      {req.requiredByDate && ` • Required by: ${new Date(req.requiredByDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleRespond(req.requestId)} 
                    loading={responding === req.requestId}
                    disabled={!donor?.isAvailable}
                    style={{ minWidth: 140, alignSelf: 'center' }}
                  >
                    {!donor?.isAvailable ? '🔴 Set Available First' : '🤝 I Can Help'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Donor Status Warning */}
      {donor && !donor.isAvailable && (
        <Card style={{ marginTop: 24, padding: 16, background: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' }}>
          <p style={{ color: '#ef4444', fontSize: 14 }}>
            ⚠️ You are currently marked as <strong>UNAVAILABLE</strong>. Go to your profile and toggle "Available to Donate" to start helping.
          </p>
        </Card>
      )}
    </div>
  );
}