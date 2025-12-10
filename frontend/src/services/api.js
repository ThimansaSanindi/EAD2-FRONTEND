// src/services/api.js
import axios from 'axios';

// Service base URLs (override via env vars). In development we prefer relative
// paths so Vite's dev-server proxy forwards requests and avoids CORS.
// For production set `VITE_USER_API`, `VITE_BOOKING_API`, `VITE_PAYMENT_API`, `VITE_MOVIE_API`, `VITE_SHOWTIME_API`.
const USER_BASE = import.meta.env.VITE_USER_API || import.meta.env.REACT_APP_USER_API || '/api/users';
const BOOKING_BASE = import.meta.env.VITE_BOOKING_API || import.meta.env.REACT_APP_BOOKING_API || '/api/bookings';
const PAYMENT_BASE = import.meta.env.VITE_PAYMENT_API || import.meta.env.REACT_APP_PAYMENT_API || '/api/payments';
const MOVIE_BASE = import.meta.env.VITE_MOVIE_API || import.meta.env.REACT_APP_MOVIE_API || '/api/movies';
const SHOWTIME_BASE = import.meta.env.VITE_SHOWTIME_API || import.meta.env.REACT_APP_SHOWTIME_API || '/api/showtimes';

const createClient = (baseURL) => {
  const c = axios.create({ baseURL, timeout: 10000, headers: { 'Content-Type': 'application/json' } });
  c.interceptors.request.use((cfg) => {
    // Attach bearer token automatically when available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        cfg.headers = cfg.headers || {};
        if (!cfg.headers.Authorization && !cfg.headers.authorization) {
          cfg.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    console.log('API request', cfg.method, cfg.baseURL + cfg.url);
    return cfg;
  }, (e) => Promise.reject(e));
  c.interceptors.response.use((res) => res.data, (error) => {
    console.error('API Error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || error.response.data.message || 'Request failed');
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

// User API
export const userAPI = {
  login: (credentials) => userClient.post('/login', credentials),
  register: (userData) => userClient.post('/register', userData),
  getUserById: (userId) => userClient.get(`/${userId}`),
  updateUser: (userId, userData) => userClient.put(`/${userId}`, userData),
  // Change password: many backends use PUT /api/users/{id}/password or POST /api/users/{id}/change-password
  // We implement the common PUT variant. Adjust if your backend differs.
  changePassword: (userId, payload) => userClient.put(`/${userId}/password`, payload),
  health: () => userClient.get('/health')
};

// Booking API - adjust endpoints to match your booking microservice
export const bookingAPI = {
  // expected: GET /api/bookings/user/{userId}
  getBookingsByUser: (userId) => bookingClient.get(`/user/${userId}`),
  getBooking: (bookingId) => bookingClient.get(`/${bookingId}`),
  // Try common booking creation endpoints in order to tolerate backend path mismatches.
  createBooking: async (bookingData) => {
    const candidates = ['/', '', '/bookings', '/bookings/', '/create', '/book', '/bookings/bookings'];
    const errors = [];
    for (const p of candidates) {
      try {
        console.debug('[bookingAPI] trying POST', bookingClient.defaults.baseURL + p);
        const res = await bookingClient.post(p, bookingData);
        console.debug('[bookingAPI] success on', p, res);
        return res;
      } catch (err) {
        const status = err?.response?.status;
        console.warn('[bookingAPI] attempt failed', { path: p, status, message: err?.message });
        errors.push({ path: p, status, message: err?.message, data: err?.response?.data });
        // If it's a 404, try next candidate. For 405 (Method Not Allowed) or other
        // server errors, keep trying other candidates (some services expose alternate paths).
        // But if it's a network/auth error with no response, stop early.
        if (!err.response) {
          throw new Error(`Network/error when attempting POST ${p}: ${err.message}`);
        }
        // continue to next candidate
      }
    }
    // All attempts failed — throw aggregated error with details
    const summary = errors.map(e => `${e.path} => ${e.status || 'NO_RESP'}: ${e.message}`).join('; ');
    const ex = new Error('All booking create attempts failed: ' + summary);
    ex.attempts = errors;
    throw ex;
  },
  updateBooking: (bookingId, bookingData) => bookingClient.put(`/${bookingId}`, bookingData),
  cancelBooking: (bookingId) => bookingClient.delete(`/${bookingId}`),
};

// Payment API - adjust endpoints to match your payment microservice
export const paymentAPI = {
  // Payments controller endpoints
  getAllPayments: () => paymentClient.get('/'),
  getPaymentById: (id) => paymentClient.get(`/${id}`),
  createPayment: (paymentData) => paymentClient.post('/', paymentData),
  updatePayment: (id, paymentData) => paymentClient.put(`/${id}`, paymentData),
  deletePayment: (id) => paymentClient.delete(`/${id}`),
  getPaymentsByUser: (userId) => paymentClient.get(`/user/${userId}`),
  getPaymentsByBooking: (bookingId) => paymentClient.get(`/booking/${bookingId}`),
  getPaymentsByMethod: (method) => paymentClient.get(`/method/${method}`),
  getPaymentsByStatus: (status) => paymentClient.get(`/status/${status}`)
};

// Movie API - adjust endpoints to match your movie microservice
export const movieAPI = {
  getAllMovies: () => movieClient.get(''),
  getMovieById: (movieId) => movieClient.get(`/${movieId}`),
  createMovie: (movieData) => movieClient.post('', movieData),
  updateMovie: (movieData) => movieClient.put('', movieData),
  deleteMovie: (movieId) => movieClient.delete(`/${movieId}`),
  getMoviesByGenre: (genre) => movieClient.get(`/genre/${genre}`),
  getMoviesByStatus: (status) => movieClient.get(`/status/${status}`),
  searchMovies: (title) => movieClient.get('/search/title', { params: { title } }),
  getMoviesByRating: (rating) => movieClient.get(`/rating/${rating}`),
  getMoviesByLanguage: (language) => movieClient.get(`/language/${language}`)
};

// Showtime API - separate microservice for showtimes
export const showtimeAPI = {
  getAllShowtimes: () => showtimeClient.get('/'),
  getShowtimeById: (showtimeId) => showtimeClient.get(`/${showtimeId}`),
  getShowtimesByMovie: (movieId) => showtimeClient.get(`/movie/${movieId}`),
  getShowtimesByTheater: (theaterId) => showtimeClient.get(`/theater/${theaterId}`),
  searchShowtimes: (movieId, theaterId) => showtimeClient.get('/search', { 
    params: { 
      ...(movieId && { movieId }), 
      ...(theaterId && { theaterId }) 
    } 
  }),
  createShowtime: (showtimeData) => showtimeClient.post('/', showtimeData),
  updateShowtime: (showtimeId, showtimeData) => showtimeClient.put(`/${showtimeId}`, showtimeData),
  deleteShowtime: (showtimeId) => showtimeClient.delete(`/${showtimeId}`)
};

export const loginUser = userAPI.login;
export const registerUser = userAPI.register;