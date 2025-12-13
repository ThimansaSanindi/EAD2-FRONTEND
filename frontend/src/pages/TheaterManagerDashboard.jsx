import { useState, useEffect } from "react";
import "../css/TheaterManagerDashboard.css";
import { movieAPI, showtimeAPI, bookingAPI, userAPI } from "../services/api";

// Safe seat formatter helper
const formatSeats = (val) => {
  try {
    if (!val) return 'N/A';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.join(', ');
          if (typeof parsed === 'object') return Object.values(parsed).filter(x => x != null).join(', ');
          return String(parsed);
        } catch {
          return val;
        }
      }
      return val;
    }
    if (typeof val === 'object') {
      return Object.values(val).filter(x => x != null && (typeof x === 'string' || typeof x === 'number')).join(', ') || 'N/A';
    }
    return String(val);
  } catch {
    return 'N/A';
  }
};

function TheaterManagerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user?.role || "").toUpperCase();
  const isManager = role === "THEATER_MANAGER" || role === "THEATRE_MANAGER" || role === "MANAGER";
  const userId = user?.id ?? user?.userId;

  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [lastFetchInfo, setLastFetchInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const [movie, setMovie] = useState({
    title: "",
    genre: "",
    language: "",
    rating: "",
    duration: "",
    releaseDate: "",
    cast: "",
    description: "",
    status: "COMING_SOON",
    posterUrl: "",
    posterPreview: null,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [moviesData, bookingsData, showtimesData] = await Promise.all([
        movieAPI.getAllMovies().catch(() => []),
          isManager
            ? bookingAPI.getAllBookings().catch(() => [])
            : userId
              ? bookingAPI.getBookingsByUser(userId).catch(() => [])
              : [],
        showtimeAPI.getAllShowtimes().catch(() => []),
      ]);
      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setShowtimes(Array.isArray(showtimesData) ? showtimesData : []);
      setLastFetchInfo(`Movies: ${moviesData?.length || 0}, Bookings: ${bookingsData?.length || 0}, Showtimes: ${showtimesData?.length || 0}`); // FIXED: Added backticks
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await userAPI.updateUser(user.id, profile);
      alert("Profile updated successfully!");
      const updatedUser = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError("Failed to update profile: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieChange = (e) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMovie((prev) => ({
        ...prev,
        posterPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log("=== SUBMITTING MOVIE ===");
    console.log("Movie state:", movie);
    
    try {
      const payload = {
        title: movie.title,
        description: movie.description || "",
        genre: movie.genre,
        duration: parseInt(movie.duration) || 120,
        rating: movie.rating || "PG",
        releaseDate: movie.releaseDate || new Date().toISOString().split('T')[0],
        posterUrl: movie.posterUrl || "",
        language: movie.language,
        cast: movie.cast || "",
        status: movie.status || "COMING_SOON"
      };
      
      console.log("Payload being sent:", payload);
      console.log("Payload as JSON:", JSON.stringify(payload, null, 2));
      console.log("Calling movieAPI.createMovie...");
      
      const result = await movieAPI.createMovie(payload);
      
      console.log("Movie created successfully:", result);
      alert("Movie added successfully!");
      
      setMovie({
        title: "",
        genre: "",
        language: "",
        rating: "",
        duration: "",
        releaseDate: "",
        cast: "",
        description: "",
        status: "COMING_SOON",
        posterUrl: "",
        posterPreview: null,
      });
      
      console.log("Refreshing movie list...");
      await fetchData();
    } catch (err) {
      console.error("=== MOVIE CREATION FAILED ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError("Failed to add movie: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
      console.log("=== MOVIE SUBMISSION COMPLETE ===");
    }
  }; // Added missing closing brace and semicolon

  return (
    <div className="dashboard-container">
      <h2>Theater Manager Dashboard</h2>
      <div style={{ marginBottom: "12px", background: "#eef6ff", padding: "10px", borderRadius: "6px", color: "#2c3e50" }}>
        <div><strong>User:</strong> {user?.name || user?.email || "Unknown"} (ID: {userId || "n/a"})</div>
        <div><strong>Role:</strong> {role || "n/a"} {isManager ? "(manager)" : ""}</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
          <button type="button" onClick={fetchData} disabled={loading} style={{ padding: "6px 12px" }}>
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
          {!loading && lastFetchInfo && <span style={{ color: "#555" }}>{lastFetchInfo}</span>}
        </div>
      </div>

      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      {loading && <p>Loading...</p>}

      {/* Profile Section */}
      <section className="form-section">
        <h3>Profile</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Address:</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
              rows={3}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </section>

      {/* Movies Table */}
      <section className="table-section">
        <h3>Movies</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Full Price</th>
                <th>Half Price</th>
              </tr>
            </thead>
            <tbody>
              {movies.length > 0 ? (
                movies.map((m) => {
                  const id = m.id || m.movieId;
                  const full = m.odcFullPrice ?? m.fullPrice ?? m.price ?? m.odc_full_price;
                  const half = m.odcHalfPrice ?? m.halfPrice ?? m.odc_half_price;
                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{m.title}</td>
                      <td>{m.genre}</td>
                      <td>{m.language}</td>
                      <td>{m.rating}</td>
                      <td>{m.status}</td>
                      <td>{full}</td>
                      <td>{half}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">No movies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bookings Table */}
      <section className="table-section">
        <h3>Bookings</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Movie ID</th>
                <th>Showtime ID</th>
                <th>Seats</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => {
                  const bookingId = b.bookingId || b.id;
                  const seats = formatSeats(b.seatsSelected);
                  return (
                    <tr key={bookingId}>
                      <td>{bookingId}</td>
                      <td>{b.movieId}</td>
                      <td>{b.showtimeId}</td>
                      <td>{seats}</td>
                      <td>{b.totalAdults}</td>
                      <td>{b.totalChildren}</td>
                      <td>{b.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Showtimes Table */}
      <section className="table-section">
        <h3>Showtimes</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Showtime ID</th>
                <th>Movie ID</th>
                <th>Theater ID</th>
                <th>Show Date</th>
                <th>Show Time</th>
                <th>Available Seats</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.length > 0 ? (
                showtimes.map((s) => {
                  const showtimeId = s.id || s.showtimeId;
                  const movieId = s.movieId || s.movie_id;
                  const theaterId = s.theaterId || s.theater_id;
                  return (
                    <tr key={showtimeId || `${movieId}-${s.showDate}-${s.showTime}`}> {/* FIXED: Added proper backticks */}
                      <td>{showtimeId}</td>
                      <td>{movieId}</td>
                      <td>{theaterId}</td>
                      <td>{s.showDate}</td>
                      <td>{s.showTime}</td>
                      <td>{s.availableSeats}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No showtimes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Movie Section */}
      <section className="form-section">
        <h3>Add New Movie</h3>
        <form onSubmit={handleMovieSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={movie.title}
                onChange={handleMovieChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Genre:</label>
              <input
                type="text"
                name="genre"
                value={movie.genre}
                onChange={handleMovieChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Language:</label>
              <input
                type="text"
                name="language"
                value={movie.language}
                onChange={handleMovieChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Rating:</label>
              <input
                type="text"
                name="rating"
                value={movie.rating}
                onChange={handleMovieChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes):</label>
              <input
                type="number"
                name="duration"
                value={movie.duration}
                onChange={handleMovieChange}
                placeholder="e.g., 120"
                required
              />
            </div>
            <div className="form-group">
              <label>Release Date:</label>
              <input
                type="date"
                name="releaseDate"
                value={movie.releaseDate}
                onChange={handleMovieChange}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={movie.status}
                onChange={handleMovieChange}
              >
                <option value="COMING_SOON">Coming Soon</option>
                <option value="NOW_SHOWING">Now Showing</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cast (comma-separated):</label>
              <input
                type="text"
                name="cast"
                value={movie.cast}
                onChange={handleMovieChange}
                placeholder="Actor 1, Actor 2, Actor 3"
              />
            </div>
            <div className="form-group">
              <label>Poster URL:</label>
              <input
                type="text"
                name="posterUrl"
                value={movie.posterUrl}
                onChange={handleMovieChange}
                placeholder="https://example.com/poster.jpg"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description:</label>
            <textarea
              name="description"
              value={movie.description}
              onChange={handleMovieChange}
              rows={4}
            />
          </div>

          <div className="form-group full-width">
            <label>Poster Image:</label>
            <input type="file" accept="image/*" onChange={handlePosterChange} />
            {movie.posterPreview && (
              <div className="poster-preview">
                <img src={movie.posterPreview} alt="Poster Preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Movie"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default TheaterManagerDashboard;