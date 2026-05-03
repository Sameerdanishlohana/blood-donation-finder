import { useState, useEffect } from 'react';
import { api } from '../api';
import { Select, Button, BloodTypeBadge, Card } from '../components/UI';
import { Spinner } from '../components/UI';

function DonorCard({ donor }) {
  return (
    <Card hover style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <BloodTypeBadge type={donor.bloodGroup} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{donor.fullName}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{donor.cityName}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: donor.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${donor.isAvailable ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 20, padding: '4px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: donor.isAvailable ? '#22c55e' : '#ef4444' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: donor.isAvailable ? '#16a34a' : '#dc2626' }}>
            {donor.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Total Donations</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#C0152A', lineHeight: 1 }}>{donor.totalDonations ?? 0}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Blood Type</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{donor.bloodGroup}</p>
        </div>
      </div>

      <a href={`tel:${donor.phone}`} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px', borderRadius: 8, background: 'rgba(192,21,42,0.06)',
        color: '#C0152A', fontSize: 13, fontWeight: 600, textDecoration: 'none',
        border: '1px solid rgba(192,21,42,0.15)', transition: 'background 0.15s',
      }}>
        📞 {donor.phone}
      </a>
    </Card>
  );
}

export default function Search({ showToast }) {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState({ blood_type: '', city_name: '' });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getBloodGroups(), api.getCities()])
      .then(([bg, c]) => { setBloodGroups(bg); setCities(c); })
      .catch(() => showToast('Failed to load options', 'error'));
  }, []);

  const handleSearch = async () => {
    if (!query.blood_type || !query.city_name) {
      showToast('Please select both blood type and city', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.searchDonors(query.blood_type, query.city_name);
      setResults(res);
      setSearched(true);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 6 }}>
          Find a Donor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Search available donors by blood type and city.</p>
      </div>

      {/* Search box */}
      <div style={{
        background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--border)',
        padding: '28px', marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'flex-end' }}>
          <Select
            label="Blood Type"
            value={query.blood_type}
            onChange={e => setQuery(q => ({ ...q, blood_type: e.target.value }))}
          >
            <option value="">Any blood type</option>
            {bloodGroups.map(bg => (
              <option key={bg.bloodGroupId} value={bg.bloodType}>{bg.bloodType}</option>
            ))}
          </Select>

          <Select
            label="City"
            value={query.city_name}
            onChange={e => setQuery(q => ({ ...q, city_name: e.target.value }))}
          >
            <option value="">Select city</option>
            {cities.map(c => (
              <option key={c.cityId} value={c.cityName}>{c.cityName}</option>
            ))}
          </Select>

          <Button loading={loading} onClick={handleSearch} size="lg" style={{ whiteSpace: 'nowrap' }}>
            {loading ? 'Searching' : 'Search →'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={40} />
        </div>
      )}

      {!loading && searched && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>{results.length}</span> donor{results.length !== 1 ? 's' : ''} found in {query.city_name} with {query.blood_type}
            </p>
            {results.length > 0 && (
              <span style={{
                background: 'rgba(192,21,42,0.08)', color: '#C0152A',
                fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                border: '1px solid rgba(192,21,42,0.15)',
              }}>Sorted by most donations</span>
            )}
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No donors found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try a different blood type or nearby city</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {results.map(d => <DonorCard key={d.donorId} donor={d} />)}
            </div>
          )}
        </>
      )}

      {!searched && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🩸</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Every second counts</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a blood type and city to find available donors</p>
        </div>
      )}
    </div>
  );
}
