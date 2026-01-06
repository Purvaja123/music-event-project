import axios from 'axios';

// Backend API URL - Update this if your backend runs on a different port
const API_URL = process.env.REACT_APP_API_URL || 'https://music-event-project-1.onrender.com/api';

// Log API URL for debugging
console.log('API URL configured:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        console.error('Network Error: Cannot connect to backend server');
        console.error('Please ensure the backend is running on https://music-event-project-1.onrender.com');
        error.networkError = true;
        error.message = 'Cannot connect to server. Please ensure the backend is running on https://music-event-project-1.onrender.com.';
      } else if (error.code === 'ERR_NETWORK') {
        console.error('Network Error: Failed to connect to backend');
        error.networkError = true;
        error.message = 'Network error. Please check if the backend server is running.';
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test backend connection
export const testConnection = async () => {
  try {
    // Try to access the register endpoint with empty data
    // This will fail validation but confirms server is running
    const response = await axios.post(`${API_URL}/auth/register`, {}, {
      timeout: 5000,
      validateStatus: () => true, // Accept any status code (400, 500, etc. means server is up)
    });
    
    // If we get any response (even error), server is running
    if (response.status >= 400 && response.status < 600) {
      return { connected: true, status: response.status };
    }
    return { connected: true, status: response.status };
  } catch (error) {
    // Network errors mean server is not accessible
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Backend connection test failed:', error);
      return { 
        connected: false, 
        error: error.message,
        details: 'Backend server is not accessible. Please ensure it is running on https://music-event-project-1.onrender.com .'
      };
    }
    // Other errors might mean server is running but endpoint has issues
    return { connected: true, status: 'unknown' };
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// User APIs
export const userAPI = {
  getArtists: () => api.get('/users/artists'),
  getOrganizers: () => api.get('/users/organizers'),
  getUserById: (id) => api.get(`/users/${id}`),
};

// Event APIs
export const eventAPI = {
  getAllEvents: () => api.get('/events'),
  getUpcomingEvents: () => api.get('/events/upcoming'),
  getEventById: (id) => api.get(`/events/${id}`),
  getOrganizerEvents: (organizerId) => api.get(`/events/organizer/${organizerId}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getEventBookings: (eventId) => api.get(`/bookings/event/${eventId}`),
  getBookingById: (id) => api.get(`/bookings/${id}`),
};

// Contract APIs
export const contractAPI = {
  createContract: (contractData) => api.post('/contracts', contractData),
  getArtistContracts: (artistId) => api.get(`/contracts/artist/${artistId}`),
  getOrganizerContracts: (organizerId) => api.get(`/contracts/organizer/${organizerId}`),
  getPendingContracts: (artistId) => api.get(`/contracts/artist/${artistId}/pending`),
  updateContractStatus: (id, status) => api.put(`/contracts/${id}/status`, { status }),
  getContractById: (id) => api.get(`/contracts/${id}`),
  linkEventToContract: (contractId, eventId) => api.put(`/contracts/${contractId}/link-event`, { eventId }),
};

export default api;







