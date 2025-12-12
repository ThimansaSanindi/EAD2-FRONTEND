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
const SEAT_BASE = import.meta.env.VITE_SEAT_API || import.meta.env.REACT_APP_SEAT_API || '/api/seats';


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
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    if (error.response) {
      throw new Error(error.response.data.error || error.response.data.message || error.response.statusText || 'Request failed');
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
  login: (credentials) => userClient.post('/login', credentials),
  register: (userData) => userClient.post('/register', userData),
  getUserById: (userId) => userClient.get(`/${userId}`),
  updateUser: (userId, userData) => userClient.put(`/${userId}`, userData),
  // Change password: many backends use PUT /api/users/{id}/password or POST /api/users/{id}/change-password
  // We implement the common PUT variant. Adjust if your backend differs.
  deleteUser: (userId) => userClient.delete(`/${userId}`),
  changePassword: (userId, payload) => userClient.put(`/${userId}/password`, payload),
  health: () => userClient.get('/health')
};

// Booking API - adjust endpoints to match your booking microservice
export const bookingAPI = {
  // expected: GET /api/bookings/user/{userId}
  getBookingsByUser: (userId) => bookingClient.get(`/user/${userId}`),
  getBooking: (bookingId) => bookingClient.get(`/${bookingId}`),
  createBooking: (bookingData) => bookingClient.post('', bookingData),
  updateBooking: (bookingId, bookingData) => bookingClient.put(`/${bookingId}`, bookingData),
  cancelBooking: (bookingId) => bookingClient.delete(`/${bookingId}`),
};

// Payment API - adjust endpoints to match your payment microservice
export const paymentAPI = {
  // Payments controller endpoints
  getAllPayments: () => paymentClient.get(''),
  getPaymentById: (id) => paymentClient.get(`/${id}`),
  createPayment: (paymentData) => paymentClient.post('', paymentData),
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

export const seatAPI = {
  getSeatsByShowtime: (showtimeId) => seatClient.get(`/showtime/${showtimeId}`),
  
  getAvailableSeats: (showtimeId) => seatClient.get(`/showtime/${showtimeId}/available`),
  
  // Add this endpoint to SeatController first
  getSeatAvailability: (showtimeId) => seatClient.get(`/showtime/${showtimeId}/availability`),
  
  reserveSeats: (showtimeId, seatNumbers) => 
    seatClient.post(`/showtime/${showtimeId}/reserve`, { seats: seatNumbers }),
  
  // Optional: initialization endpoint
  initializeSeats: (showtimeId) => seatClient.post(`/showtime/${showtimeId}/init`)
};

export const loginUser = userAPI.login;
export const registerUser = userAPI.register;