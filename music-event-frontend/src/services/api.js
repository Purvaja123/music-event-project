import axios from 'axios';

// ✅ Backend base URL (DO NOT add /auth here)
const api = axios.create({
  baseURL: 'https://music-event-project-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =======================
// ✅ Request Interceptor
// IMPORTANT: Do NOT send token for login/register
// =======================
api.interceptors.request.use(
  (config) => {
    const isAuthRequest =
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register');

    if (!isAuthRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// Response Interceptor
// =======================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Cannot connect to backend. Check server status.';
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// =======================
// Auth APIs (PUBLIC)
// =======================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// =======================
// User APIs (PROTECTED)
// =======================
export const userAPI = {
  getArtists: () => api.get('/users/artists'),
  getOrganizers: () => api.get('/users/organizers'),
  getUserById: (id) => api.get(`/users/${id}`),
};

// =======================
// Event APIs
// =======================
export const eventAPI = {
  getAllEvents: () => api.get('/events'),
  getUpcomingEvents: () => api.get('/events/upcoming'),
  getEventById: (id) => api.get(`/events/${id}`),
  getOrganizerEvents: (organizerId) =>
    api.get(`/events/organizer/${organizerId}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// =======================
// Booking APIs
// =======================
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getEventBookings: (eventId) => api.get(`/bookings/event/${eventId}`),
  getBookingById: (id) => api.get(`/bookings/${id}`),
};

// =======================
// Contract APIs
// =======================
export const contractAPI = {
  createContract: (contractData) => api.post('/contracts', contractData),
  getArtistContracts: (artistId) =>
    api.get(`/contracts/artist/${artistId}`),
  getOrganizerContracts: (organizerId) =>
    api.get(`/contracts/organizer/${organizerId}`),
  getPendingContracts: (artistId) =>
    api.get(`/contracts/artist/${artistId}/pending`),
  updateContractStatus: (id, status) =>
    api.put(`/contracts/${id}/status`, { status }),
  getContractById: (id) => api.get(`/contracts/${id}`),
  linkEventToContract: (contractId, eventId) =>
    api.put(`/contracts/${contractId}/link-event`, { eventId }),
};

export default api;
