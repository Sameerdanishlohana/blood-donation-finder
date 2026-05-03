import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { BloodTypeBadge, AvailabilityToggle, Card, Button } from '../components/UI';

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

function StatBadge({ label, value, color = '#C0152A' }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 16px' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
    </div>
  );
}

export default function Profile({ setPage, showToast }) {
  const { donor, logout, refreshProfile } = useAuth();
  const [toggling, setToggling] = useState(false);

  if (!donor) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Sign in to view your profile</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>You need an account to access this page.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button onClick={() => setPage('login')}>Sign In</Button>
          <Button variant="secondary" onClick={() => setPage('register')}>Register</Button>
        </div>
      </div>
    );
  }

  const handleAvailabilityToggle = async (val) => {
    setToggling(true);
    try {
      await api.updateAvailability(val);
      await refreshProfile();
      showToast(`Availability set to ${val ? 'Available' : 'Unavailable'}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setToggling(false);
    }
  };

  const memberSince = donor.registrationDate
    ? new Date(donor.registrationDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })
    : '—';

  const lastDonation = donor.lastDonationDate
    ? new Date(donor.lastDonationDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No donations yet';

  const initials = donor.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 6 }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Manage your donor profile and availability.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Identity card */}
          <Card style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#C0152A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: '#fff',
              margin: '0 auto 16px', border: '3px solid rgba(192,21,42,0.2)',
            }}>{initials}</div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{donor.fullName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{donor.email}</p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <BloodTypeBadge type={donor.bloodGroup} size="lg" />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <p>Member since {memberSince}</p>
              <p style={{ marginTop: 4 }}>{donor.cityName}</p>
            </div>
          </Card>

          {/* Availability toggle */}
          <Card style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Donation Availability</p>
            <AvailabilityToggle
              isAvailable={donor.isAvailable}
              onChange={handleAvailabilityToggle}
              loading={toggling}
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
              {donor.isAvailable
                ? 'You appear in search results. Donors in your city can contact you.'
                : 'You are hidden from search results. Toggle on when ready to donate.'}
            </p>
          </Card>

          {/* Sign out */}
          <Button variant="ghost" fullWidth onClick={logout} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            Sign Out
          </Button>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ borderRight: '1px solid var(--border)' }}>
                <StatBadge label="Total Donations" value={donor.totalDonations ?? 0} color="#C0152A" />
              </div>
              <div style={{ borderRight: '1px solid var(--border)' }}>
                <StatBadge label="Lives Impacted" value={(donor.totalDonations ?? 0) * 3} color="#b91c1c" />
              </div>
              <div>
                <StatBadge label="Donor Rank" value={donor.totalDonations >= 10 ? '🏅' : donor.totalDonations >= 5 ? '⭐' : '🩸'} color="#C0152A" />
              </div>
            </div>
            <div style={{ padding: '12px 20px' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {donor.totalDonations >= 10
                  ? 'Elite Donor — Thank you for your incredible commitment!'
                  : donor.totalDonations >= 5
                  ? 'Star Donor — You\'re making a real difference.'
                  : 'Every donation matters. Keep going!'}
              </p>
            </div>
          </Card>

          {/* Details */}
          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Account Details</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Your registered information</p>
            <InfoRow label="Full Name" value={donor.fullName} />
            <InfoRow label="Email" value={donor.email} />
            <InfoRow label="Phone" value={donor.phone} />
            <InfoRow label="Blood Type" value={donor.bloodGroup} />
            <InfoRow label="City" value={donor.cityName} />
            <InfoRow label="Last Donation" value={lastDonation} />
            <InfoRow label="Member Since" value={memberSince} />
          </Card>

          {/* Donation tip */}
          <div style={{
            background: 'rgba(192,21,42,0.05)', borderRadius: 14,
            border: '1px solid rgba(192,21,42,0.12)', padding: '18px 20px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#C0152A', marginBottom: 4 }}>Donation Tip</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                You can safely donate whole blood every 56 days (8 weeks). Stay hydrated and eat iron-rich foods before your next donation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
