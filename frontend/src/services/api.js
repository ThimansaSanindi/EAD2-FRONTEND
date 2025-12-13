// src/services/api.js
import axios from 'axios';

// Service base URLs (override via env vars). In development we prefer relative
// paths so Vite's dev-server proxy forwards requests and avoids CORS.
// For production set VITE_USER_API, VITE_BOOKING_API, VITE_PAYMENT_API, VITE_MOVIE_API, VITE_SHOWTIME_API.
const USER_BASE = import.meta.env.VITE_USER_API || import.meta.env.REACT_APP_USER_API || '/api/users';
const BOOKING_BASE = import.meta.env.VITE_BOOKING_API || import.meta.env.REACT_APP_BOOKING_API || '/api/bookings';
const PAYMENT_BASE = import.meta.env.VITE_PAYMENT_API || import.meta.env.REACT_APP_PAYMENT_API || '/api/payments';
const MOVIE_BASE = import.meta.env.VITE_MOVIE_API || import.meta.env.REACT_APP_MOVIE_API || '/api/movies';
const SHOWTIME_BASE = import.meta.env.VITE_SHOWTIME_API || import.meta.env.REACT_APP_SHOWTIME_API || '/api/showtimes';
const SEAT_BASE = import.meta.env.VITE_SEAT_API || import.meta.env.REACT_APP_SEAT_API || '/api/seats';

const createClient = (baseURL) => {
  // Normalize base URL to avoid double slashes (e.g., trailing '/') which can 404 on
  // Spring Boot when trailing slash matching is disabled (default in Boot 3).
  const normalizedBase = (baseURL || '').replace(/\/+$/, '') || '/';
  const c = axios.create({ baseURL: normalizedBase, timeout: 10000, headers: { 'Content-Type': 'application/json' } });
  c.interceptors.request.use((cfg) => {
    // Attach bearer token automatically when available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        cfg.headers = cfg.headers || {};
        if (!cfg.headers.Authorization && !cfg.headers.authorization) {
          cfg.headers.Authorization = `Bearer ${token}`; // Fixed: Added backticks
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    // Avoid sending a trailing slash-only path which may 404 on some backends
    if (cfg && typeof cfg.url === 'string' && cfg.url === '/') {
      cfg.url = '';
    }
    console.log('API request', cfg.method, cfg.baseURL + cfg.url);
    return cfg;
  }, (e) => Promise.reject(e));
  c.interceptors.response.use((res) => res.data, (error) => {
    console.error('API Error:', error);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('Full Response:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request Payload:', error.config?.data);
    if (error.response) {
      const errData = error.response.data;
      // Extract detailed error message from various backend formats
      const message = errData?.error || errData?.message || errData?.details || 
                     (typeof errData === 'string' ? errData : null) ||
                     error.response.statusText || 'Request failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error('Request configuration error');
    }
  });
  return c;
};

const userClient = createClient(USER_BASE);
const bookingClient = createClient(BOOKING_BASE);
const paymentClient = createClient(PAYMENT_BASE);
const movieClient = createClient(MOVIE_BASE);
const showtimeClient = createClient(SHOWTIME_BASE);
const seatClient = createClient(SEAT_BASE);

// User API
export const userAPI = {
  login: (credentials) => userClient.post('login', credentials),
  register: (userData) => userClient.post('register', userData),
  getUserById: (userId) => userClient.get(`${userId}`), // Fixed: Added backticks
  updateUser: (userId, userData) => userClient.put(`${userId}`, userData), // Fixed: Added backticks
  // Change password: many backends use PUT /api/users/{id}/password or POST /api/users/{id}/change-password
  // We implement the common PUT variant. Adjust if your backend differs.
  changePassword: (userId, payload) => userClient.put(`${userId}/password`, payload), // Fixed: Added backticks
  deleteUser: (userId) => userClient.delete(`${userId}`), // Fixed: Added backticks
  health: () => userClient.get('health')
};

// Booking API - adjust endpoints to match your booking microservice
export const bookingAPI = {
  getAllBookings: () => bookingClient.get(''),
  // expected: GET /api/bookings/user/{userId}
  getBookingsByUser: (userId) => bookingClient.get(`user/${userId}`), // Fixed: Added backticks
  getBooking: (bookingId) => bookingClient.get(`${bookingId}`), // Fixed: Added backticks
  // Standard RESTful endpoint: POST /api/bookings (no trailing slash)
  createBooking: (bookingData) => bookingClient.post('', bookingData),
  updateBooking: (bookingId, bookingData) => bookingClient.put(`${bookingId}`, bookingData), // Fixed: Added backticks
  cancelBooking: (bookingId) => bookingClient.delete(`${bookingId}`), // Fixed: Added backticks
};

// Payment API - adjust endpoints to match your payment microservice
export const paymentAPI = {
  // Payments controller endpoints
  getAllPayments: () => paymentClient.get(''),
  getPaymentById: (id) => paymentClient.get(`${id}`), // Fixed: Added backticks
  createPayment: (paymentData) => paymentClient.post('', paymentData),
  updatePayment: (id, paymentData) => paymentClient.put(`${id}`, paymentData), // Fixed: Added backticks
  deletePayment: (id) => paymentClient.delete(`${id}`), // Fixed: Added backticks
  getPaymentsByUser: (userId) => paymentClient.get(`user/${userId}`), // Fixed: Added backticks
  getPaymentsByBooking: (bookingId) => paymentClient.get(`booking/${bookingId}`), // Fixed: Added backticks
  getPaymentsByMethod: (method) => paymentClient.get(`method/${method}`), // Fixed: Added backticks
  getPaymentsByStatus: (status) => paymentClient.get(`status/${status}`) // Fixed: Added backticks
};

// Movie API - adjust endpoints to match your movie microservice
export const movieAPI = {
  getAllMovies: () => movieClient.get(''),
  getMovieById: (movieId) => movieClient.get(`${movieId}`), // Fixed: Added backticks
  createMovie: (movieData) => movieClient.post('', movieData),
  updateMovie: (movieData) => movieClient.put('', movieData),
  deleteMovie: (movieId) => movieClient.delete(`${movieId}`), // Fixed: Added backticks
  getMoviesByGenre: (genre) => movieClient.get(`genre/${genre}`), // Fixed: Added backticks
  getMoviesByStatus: (status) => movieClient.get(`status/${status}`), // Fixed: Added backticks
  searchMovies: (title) => movieClient.get('search/title', { params: { title } }),
  getMoviesByRating: (rating) => movieClient.get(`rating/${rating}`), // Fixed: Added backticks
  getMoviesByLanguage: (language) => movieClient.get(`language/${language}`) // Fixed: Added backticks
};

// Showtime API - separate microservice for showtimes
export const showtimeAPI = {
  // Backend exposes GET /api/showtimes (no trailing slash)
  getAllShowtimes: () => showtimeClient.get(''),
  getShowtimeById: (showtimeId) => showtimeClient.get(`${showtimeId}`), // Fixed: Added backticks
  getShowtimesByMovie: (movieId) => showtimeClient.get(`movie/${movieId}`), // Fixed: Added backticks
  getShowtimesByTheater: (theaterId) => showtimeClient.get(`theater/${theaterId}`), // Fixed: Added backticks
  searchShowtimes: (movieId, theaterId) => showtimeClient.get('search', {
    params: {
      ...(movieId && { movieId }),
      ...(theaterId && { theaterId })
    }
  }),
  createShowtime: (showtimeData) => showtimeClient.post('', showtimeData),
  updateShowtime: (showtimeId, showtimeData) => showtimeClient.put(`${showtimeId}`, showtimeData), // Fixed: Added backticks
  deleteShowtime: (showtimeId) => showtimeClient.delete(`${showtimeId}`) // Fixed: Added backticks
};

export const seatAPI = {
  getSeatsByShowtime: (showtimeId) => seatClient.get(`showtime/${showtimeId}`), // Fixed: Added backticks
  
  getAvailableSeats: (showtimeId) => seatClient.get(`showtime/${showtimeId}/available`), // Fixed: Added backticks
  
  // Add this endpoint to SeatController first
  getSeatAvailability: (showtimeId) => seatClient.get(`showtime/${showtimeId}/availability`), // Fixed: Added backticks
  
  reserveSeats: (showtimeId, seatNumbers) => 
    seatClient.post(`showtime/${showtimeId}/reserve`, { seats: seatNumbers }), // Fixed: Added backticks
  
  // Optional: initialization endpoint
  initializeSeats: (showtimeId) => seatClient.post(`showtime/${showtimeId}/init`) // Fixed: Added backticks
};

export const loginUser = userAPI.login;
export const registerUser = userAPI.register;