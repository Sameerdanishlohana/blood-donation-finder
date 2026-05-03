const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('bl_token');
const getHospitalToken = () => localStorage.getItem('hospital_token');
const getAdminToken = () => localStorage.getItem('admin_token');

const getAuthToken = () => {
  return getToken() || getHospitalToken() || getAdminToken();
};

const req = async (method, path, body, isHospital = false, isAdmin = false) => {
  const headers = { 'Content-Type': 'application/json' };
  let token;
  
  if (isHospital) token = getHospitalToken();
  else if (isAdmin) token = getAdminToken();
  else token = getToken();
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // ============= DONOR AUTH =============
  registerDonor: (body) => req('POST', '/auth/donor/register', body),
  loginDonor: (body) => req('POST', '/auth/donor/login', body),

  // ============= HOSPITAL AUTH =============
  registerHospital: (body) => req('POST', '/hospitals/register', body, false, false),
  loginHospital: (body) => req('POST', '/hospitals/login', body, false, false),

  // ============= ADMIN AUTH =============
  loginAdmin: (body) => req('POST', '/admin/login', body, false, false),

  // ============= LOOKUPS =============
  getBloodGroups: () => req('GET', '/auth/blood-groups'),
  getCities: () => req('GET', '/auth/cities'),
  getStatuses: () => req('GET', '/hospitals/statuses'),
  // Add these to your api object in api/index.js

// Get donor's donation history
getDonationHistory: () => req('GET', '/donations/my-history'),

// Get active blood requests (for donors to respond)
getActiveRequests: () => req('GET', '/donors/requests'),

// Respond to a blood request (express interest)
respondToRequest: (requestId) => req('POST', `/donors/requests/${requestId}/respond`),

// Record a donation (after donating)
recordDonation: (data) => req('POST', '/donations', data),

  // ============= DONORS =============
  searchDonors: (blood_type, city_name) =>
    req('GET', `/donors/search?blood_type=${encodeURIComponent(blood_type)}&city_name=${encodeURIComponent(city_name)}`),
  getProfile: () => req('GET', '/donors/profile'),
  updateAvailability: (is_available) => req('PUT', '/donors/availability', { is_available }),

  // ============= HOSPITAL =============
  createBloodRequest: (body) => req('POST', '/hospitals/requests', body, true),
  getHospitalRequests: () => req('GET', '/hospitals/requests', null, true),
  updateRequestStatus: (id, status_id) => req('PUT', `/hospitals/requests/${id}/status`, { status_id }, true),
  getMatchingDonorsForRequest: (id) => req('GET', `/hospitals/requests/${id}/matching-donors`, null, true),
  getHospitalDonations: () => req('GET', '/hospitals/donations', null, true),
  getHospitalProfile: () => req('GET', '/hospitals/profile', null, true),
  

  // ============= ADMIN =============
  getAdminStats: () => req('GET', '/admin/stats', null, false, true),
  getAllDonors: () => req('GET', '/admin/donors', null, false, true),
  deleteDonor: (id) => req('DELETE', `/admin/donors/${id}`, null, false, true),
  getAllHospitals: () => req('GET', '/admin/hospitals', null, false, true),
  verifyHospital: (id) => req('PUT', `/admin/hospitals/${id}/verify`, null, false, true),
  deleteHospital: (id) => req('DELETE', `/admin/hospitals/${id}`, null, false, true),
  getAllRequests: () => req('GET', '/admin/requests', null, false, true),
  getAllDonations: () => req('GET', '/admin/donations', null, false, true),

  // Add to your api object
getProfile: () => req('GET', '/donors/profile'),
// Donor - Emergency Requests
getEmergencyRequests: () => req('GET', '/donor/emergency'),
respondToEmergencyRequest: (requestId) => req('POST', `/donor/${requestId}/respond`),
getMyResponses: () => req('GET', '/donor/my-responses'),
// Get donor's pending donations (responses waiting for confirmation)
getPendingDonations: () => req('GET', '/donations/pending'),
  // ============= DONATIONS =============
  recordDonation: (body) => req('POST', '/donations', body, true),
  getMyDonationHistory: () => req('GET', '/donations/my-history'),
};