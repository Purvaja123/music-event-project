import axios from 'axios';

// Base URL from environment variable
export const API_URL = process.env.REACT_APP_API_URL || 'https://music-event-project-1.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle network errors & 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Cannot connect to backend. Check server URL and status.';
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
// Auth APIs
// =======================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// =======================
// User APIs
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
  getOrganizerEvents: (organizerId) => api.get(`/events/organizer/${organizerId}`),
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
  getArtistContracts: (artistId) => api.get(`/contracts/artist/${artistId}`),
  getOrganizerContracts: (organizerId) => api.get(`/contracts/organizer/${organizerId}`),
  getPendingContracts: (artistId) => api.get(`/contracts/artist/${artistId}/pending`),
  updateContractStatus: (id, status) => api.put(`/contracts/${id}/status`, { status }),
  getContractById: (id) => api.get(`/contracts/${id}`),
  linkEventToContract: (contractId, eventId) => api.put(`/contracts/${contractId}/link-event`, { eventId }),
};

// Default export for general use
export default api;
