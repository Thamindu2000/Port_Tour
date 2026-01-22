import axios from 'axios';



const BASE_PATH = '/port-booking-system'; 

// const API_BASE_URL =
//   process.env.REACT_APP_API_URL ||
//   `http://localhost:8080${BASE_PATH}`;

  const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  `http://localhost:8080${BASE_PATH}`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to programmatically set/unset Authorization header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Ensure the Authorization header is set globally if a token exists
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - token:', token ? 'present' : 'missing');
    console.log('Request URL:', config.url);
    console.log('Request headers:', config.headers);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // For FormData, delete Content-Type to let axios set multipart/form-data automatically
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      console.log('Added Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    
    if (error.response?.status === 401) {
      console.log('401 error - removing token and redirecting to login');
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/signin', credentials),
  register: (userData) => api.post('/api/auth/signup', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  getAllUsers: () => api.get('/api/auth/users'),
  createAdmin: (adminData) => api.post('/api/auth/create-admin', adminData),
  createClerk: (clerkData) => api.post('/api/auth/create-clerk', clerkData),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData, attachments = null) => {
    const formData = new FormData();
    formData.append('bookingRequest', JSON.stringify(bookingData));
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => formData.append('attachments', file));
    }
    return api.post('/api/bookings', formData);
  },
  getMyBookings: () => api.get('/api/bookings/my-bookings'),
  getAllBookings: () => api.get('/api/bookings'),
  getPendingBookings: () => api.get('/api/bookings/pending'),
  getPendingBookingsCount: () => api.get('/api/bookings/pending/count'),
  getBookingsByDate: (date) => api.get(`/api/bookings/date/${date}`),
  getUpcomingBookings: () => api.get('/api/bookings/upcoming'),
  updateBookingStatus: (id, status, extra = {}) =>
    api.put(`/api/bookings/${id}/status`, { status, ...extra }),
  reportMissingBuses: (bookingId, reportData) =>
    api.post(`/api/bookings/${bookingId}/report-missing-buses`, reportData),
  getMissingBusReports: () => api.get('/api/bookings/missing-bus-reports'),
  downloadAttachment: (bookingId, filename) => api.get(`/api/bookings/${bookingId}/attachments/${filename}`, { responseType: 'blob' }),
  downloadMyAttachment: (bookingId, filename) => api.get(`/api/bookings/my/${bookingId}/attachments/${filename}`, { responseType: 'blob' }),
};

// Settings API
export const settingsAPI = {
  updateFooterSettings: (footerData) => api.put('/api/settings/footer', footerData),
};

// Public API
export const publicAPI = {
  getPublicBookingsByDate: (date) =>
    api.get(`/api/public/bookings/date/${date}`),
  getPublicUpcomingBookings: () => api.get('/api/public/bookings/upcoming'),
  getClerkAcceptedBookings: () => api.get('/api/public/bookings/clerk-accepted'),
  getClerkApprovedBookingsByDate: (date) =>
    api.get(`/api/public/bookings/clerk-approved/${date}`),
  sendChatbotMessage: (data) => api.post('/api/public/chatbot', data),
  checkAvailability: (date) =>
    api.get('/api/public/bookings/check-availability', {
      params: { date },
    }),
  getFooterSettings: () => api.get('/api/settings/footer'),
};

export default api;