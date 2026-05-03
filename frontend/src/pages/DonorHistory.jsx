import { useState, useEffect } from 'react';
import { api } from '../api';
import { Card, Spinner, BloodTypeBadge } from '../components/UI';

export default function DonorHistory({ showToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getDonationHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      showToast('Could not load donation history', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={40} />
      </div>
    );
  }

  const totalDonations = history.reduce((sum, d) => sum + (d.quantityUnits || 1), 0);
  const livesSaved = totalDonations * 3;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
          My Donation History
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your lifesaving contributions</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#C0152A' }}>{history.length}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Donations</p>
        </Card>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#C0152A' }}>{totalDonations}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Units Donated</p>
        </Card>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#C0152A' }}>{livesSaved}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lives Impacted</p>
        </Card>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <span style={{ fontSize: 48 }}>🩸</span>
          <p style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: 'var(--text-primary)' }}>
            No donations yet
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            When you donate, your history will appear here
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((donation, index) => (
            <Card key={index} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <BloodTypeBadge type={donation.bloodGroup || 'O+'} size="sm" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {donation.hospitalName}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    📅 {new Date(donation.donationDate).toLocaleDateString('en-PK', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    💉 {donation.quantityUnits || 1} unit(s) donated
                  </p>
                </div>
                <div style={{ 
                  padding: '8px 16px', 
                  borderRadius: 20, 
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22c55e',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  ✓ Completed
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}