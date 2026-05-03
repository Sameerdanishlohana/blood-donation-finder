import { useState, useEffect } from 'react';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import { api } from '../api';
import { Button, Card, Select, Input, BloodTypeBadge, Spinner } from '../components/UI';

export default function HospitalDashboard({ showToast }) {
  const { hospital, logout } = useHospitalAuth();
  const [requests, setRequests] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({ 
    patient_name: '', 
    blood_group_id: '', 
    city_id: '', 
    quantity_units: 1, 
    urgency_level: 'Normal', 
    contact_person: '', 
    contact_phone: '', 
    required_by_date: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading hospital data...');
      
      // Load all required data in parallel
      const [reqs, bg, c, stat] = await Promise.all([
        api.getHospitalRequests().catch(err => {
          console.error('Failed to load requests:', err);
          return [];
        }),
        api.getBloodGroups().catch(err => {
          console.error('Failed to load blood groups:', err);
          return [];
        }),
        api.getCities().catch(err => {
          console.error('Failed to load cities:', err);
          return [];
        }),
        api.getStatuses().catch(err => {
          console.error('Failed to load statuses:', err);
          return [];
        })
      ]);
      
      console.log('Blood groups loaded:', bg);
      console.log('Cities loaded:', c);
      
      setRequests(reqs || []);
      setBloodGroups(bg || []);
      setCities(c || []);
      setStatuses(stat || []);
      
    } catch (err) {
      console.error('Load data error:', err);
      showToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async () => {
    // Validate required fields
    if (!newRequest.patient_name) {
      showToast('Patient name is required', 'error');
      return;
    }
    if (!newRequest.blood_group_id) {
      showToast('Please select a blood type', 'error');
      return;
    }
    if (!newRequest.city_id) {
      showToast('Please select a city', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('Creating request with data:', newRequest);
      
      await api.createBloodRequest({
        patient_name: newRequest.patient_name,
        blood_group_id: parseInt(newRequest.blood_group_id),
        city_id: parseInt(newRequest.city_id),
        quantity_units: newRequest.quantity_units || 1,
        urgency_level: newRequest.urgency_level,
        contact_person: newRequest.contact_person,
        contact_phone: newRequest.contact_phone,
        required_by_date: newRequest.required_by_date,
      });
      
      showToast('Blood request created successfully!', 'success');
      setShowCreateForm(false);
      setNewRequest({ 
        patient_name: '', 
        blood_group_id: '', 
        city_id: '', 
        quantity_units: 1, 
        urgency_level: 'Normal', 
        contact_person: '', 
        contact_phone: '', 
        required_by_date: '' 
      });
      loadData(); // Refresh the list
      
    } catch (err) {
      console.error('Create request error:', err);
      showToast(err.message || 'Failed to create request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (requestId, statusId) => {
    try {
      await api.updateRequestStatus(requestId, statusId);
      showToast('Status updated successfully', 'success');
      loadData(); // Refresh the list
    } catch (err) {
      console.error('Update status error:', err);
      showToast(err.message, 'error');
    }
  };
  // Add this function
const confirmDonation = async (donationId) => {
  try {
    await api.confirmDonation(donationId);
    showToast('Donation confirmed!', 'success');
    loadData();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

  const getUrgencyColor = (level) => {
    if (level === 'Emergency') return '#dc2626';
    if (level === 'High') return '#f97316';
    if (level === 'Normal') return '#22c55e';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>
            Hospital Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome, {hospital?.hospitalName || 'Hospital'}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={() => setShowCreateForm(true)}>+ New Blood Request</Button>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <Card style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            Create Emergency Blood Request
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <Input 
              label="Patient Name *" 
              placeholder="Enter patient name"
              value={newRequest.patient_name} 
              onChange={e => setNewRequest({ ...newRequest, patient_name: e.target.value })} 
            />
            
            <Select 
              label="Blood Type *"
              value={newRequest.blood_group_id}
              onChange={e => setNewRequest({ ...newRequest, blood_group_id: e.target.value })}
            >
              <option value="">Select blood type</option>
              {bloodGroups.map(bg => (
                <option key={bg.bloodGroupId} value={bg.bloodGroupId}>
                  {bg.bloodType}
                </option>
              ))}
            </Select>
            
            <Select 
              label="City *"
              value={newRequest.city_id}
              onChange={e => setNewRequest({ ...newRequest, city_id: e.target.value })}
            >
              <option value="">Select city</option>
              {cities.map(city => (
                <option key={city.cityId} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </Select>
            
            <Input 
              label="Quantity (Units)" 
              type="number" 
              min="1"
              value={newRequest.quantity_units} 
              onChange={e => setNewRequest({ ...newRequest, quantity_units: parseInt(e.target.value) || 1 })} 
            />
            
            <Select 
              label="Urgency Level"
              value={newRequest.urgency_level}
              onChange={e => setNewRequest({ ...newRequest, urgency_level: e.target.value })}
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </Select>
            
            <Input 
              label="Contact Person" 
              placeholder="Person to contact"
              value={newRequest.contact_person} 
              onChange={e => setNewRequest({ ...newRequest, contact_person: e.target.value })} 
            />
            
            <Input 
              label="Contact Phone" 
              placeholder="Phone number"
              value={newRequest.contact_phone} 
              onChange={e => setNewRequest({ ...newRequest, contact_phone: e.target.value })} 
            />
            
            <Input 
              label="Required By Date" 
              type="date"
              value={newRequest.required_by_date} 
              onChange={e => setNewRequest({ ...newRequest, required_by_date: e.target.value })} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button onClick={createRequest} loading={submitting}>
              {submitting ? 'Creating...' : 'Create Request'}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Requests List */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        Your Blood Requests
      </h2>
      
      {requests.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No blood requests yet.</p>
          <Button variant="secondary" onClick={() => setShowCreateForm(true)} style={{ marginTop: 16 }}>
            Create your first request →
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(req => (
            <Card key={req.requestId} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <BloodTypeBadge type={req.bloodGroup} />
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      background: getUrgencyColor(req.urgencyLevel), 
                      color: '#fff', 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {req.urgencyLevel}
                    </span>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      background: 'rgba(0,0,0,0.1)', 
                      fontSize: 12 
                    }}>
                      {req.quantityUnits} unit(s)
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
                    {req.patientName}
                  </h3>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
                    📍 {req.cityName} • Requested: {new Date(req.requestedDate).toLocaleDateString()}
                    {req.requiredByDate && ` • Required by: ${new Date(req.requiredByDate).toLocaleDateString()}`}
                  </p>
                  
                  {(req.contactPerson || req.contactPhone) && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      📞 Contact: {req.contactPerson} {req.contactPhone ? `(${req.contactPhone})` : ''}
                    </p>
                  )}
                </div>
                
                <div style={{ minWidth: 150 }}>
                  <Select 
                    label="Status"
                    value={req.statusId}
                    onChange={e => updateStatus(req.requestId, parseInt(e.target.value))}
                  >
                    {statuses.map(s => (
                      <option key={s.statusId} value={s.statusId}>
                        {s.statusName}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}