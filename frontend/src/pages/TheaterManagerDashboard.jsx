import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import './TheaterManagerDashboard.css';

const TheaterManagerDashboard = () => {
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('movies');
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Movie Form State
    const [movieForm, setMovieForm] = useState({
        title: '',
        poster: null,
        posterPreview: '',
        duration: '',
        genre: '',
        releaseDate: '',
        synopsis: '',
        cast: '',
        rating: '',
        language: '',
        director: '',
        trailerUrl: ''
    });

    // Showtime Form State
    const [showtimeForm, setShowtimeForm] = useState({
        movieId: '',
        screen: '',
        date: '',
        time: '',
        priceAdult: '',
        priceChild: '',
        availableSeats: ''
    });

    useEffect(() => {
        // Check if user is logged in and is a theater manager
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || userData.role !== 'THEATER_MANAGER') {
            navigate('/manager/login');
            return;
        }
        setUser(userData);
        fetchMovies();
        fetchShowtimes();
    }, [navigate]);

    const fetchMovies = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/movies/theater/${user.theaterId}`);
            const data = await response.json();
            setMovies(data);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const fetchShowtimes = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/showtimes/theater/${user.theaterId}`);
            const data = await response.json();
            setShowtimes(data);
        } catch (error) {
            console.error('Error fetching showtimes:', error);
        }
    };

    const handleMovieSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const formData = new FormData();
            
            // Append all form fields
            Object.keys(movieForm).forEach(key => {
                if (key !== 'posterPreview' && movieForm[key]) {
                    formData.append(key, movieForm[key]);
                }
            });
            
            formData.append('theaterId', user.theaterId);
            formData.append('status', 'ACTIVE');

            const response = await fetch('http://localhost:8080/api/movies', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to add movie');
            }

            const newMovie = await response.json();
            alert('Movie added successfully!');
            
            // Reset form
            setMovieForm({
                title: '',
                poster: null,
                posterPreview: '',
                duration: '',
                genre: '',
                releaseDate: '',
                synopsis: '',
                cast: '',
                rating: '',
                language: '',
                director: '',
                trailerUrl: ''
            });

            // Refresh movie list
            fetchMovies();

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowtimeSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch('http://localhost:8080/api/showtimes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...showtimeForm,
                    theaterId: user.theaterId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add showtime');
            }

            alert('Showtime added successfully!');
            setShowtimeForm({
                movieId: '',
                screen: '',
                date: '',
                time: '',
                priceAdult: '',
                priceChild: '',
                availableSeats: ''
            });

            fetchShowtimes();

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/manager/login');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMovieForm({
                ...movieForm,
                poster: file,
                posterPreview: URL.createObjectURL(file)
            });
        }
    };

    const deleteMovie = async (movieId) => {
        if (!window.confirm('Are you sure you want to delete this movie?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete movie');
            }

            alert('Movie deleted successfully!');
            fetchMovies();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const deleteShowtime = async (showtimeId) => {
        if (!window.confirm('Are you sure you want to delete this showtime?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/showtimes/${showtimeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete showtime');
            }

            alert('Showtime deleted successfully!');
            fetchShowtimes();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    if (showProfile) {
        return <Profile />;
    }

    return (
        <div className="theater-manager-dashboard">
            {/* Header with Profile Dropdown */}
            <header className="tm-header">
                <div className="tm-header-left">
                    <h1 className="tm-logo">🎬 Theater Manager Dashboard</h1>
                    <nav className="tm-nav">
                        <button 
                            className={`tm-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            📊 Dashboard
                        </button>
                        <button 
                            className={`tm-nav-btn ${activeTab === 'movies' ? 'active' : ''}`}
                            onClick={() => setActiveTab('movies')}
                        >
                            🎬 Movies
                        </button>
                        <button 
                            className={`tm-nav-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('showtimes')}
                        >
                            🕒 Showtimes
                        </button>
                        <button 
                            className={`tm-nav-btn ${activeTab === 'pricing' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pricing')}
                        >
                            💰 Pricing
                        </button>
                        <button 
                            className={`tm-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reports')}
                        >
                            📈 Reports
                        </button>
                    </nav>
                </div>

                <div className="tm-header-right">
                    <div className="tm-profile-dropdown">
                        <button 
                            className="tm-profile-btn"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <div className="tm-profile-icon">
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                            <span className="tm-profile-name">{user?.name || 'Manager'}</span>
                            <span className="tm-dropdown-arrow">▼</span>
                        </button>
                        
                        {!showProfile && (
                            <div className="tm-dropdown-menu">
                                <button 
                                    className="tm-dropdown-item"
                                    onClick={() => setShowProfile(true)}
                                >
                                    👤 View Profile
                                </button>
                                <button className="tm-dropdown-item">
                                    ⚙️ Settings
                                </button>
                                <button className="tm-dropdown-item">
                                    🆘 Help
                                </button>
                                <hr className="tm-dropdown-divider" />
                                <button 
                                    className="tm-dropdown-item logout"
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="tm-main-content">
                {/* Dashboard Stats */}
                {activeTab === 'dashboard' && (
                    <div className="tm-dashboard">
                        <div className="tm-stats-grid">
                            <div className="tm-stat-card">
                                <div className="tm-stat-icon">🎬</div>
                                <div className="tm-stat-info">
                                    <h3>{movies.length}</h3>
                                    <p>Total Movies</p>
                                </div>
                            </div>
                            <div className="tm-stat-card">
                                <div className="tm-stat-icon">🕒</div>
                                <div className="tm-stat-info">
                                    <h3>{showtimes.length}</h3>
                                    <p>Total Showtimes</p>
                                </div>
                            </div>
                            <div className="tm-stat-card">
                                <div className="tm-stat-icon">💰</div>
                                <div className="tm-stat-info">
                                    <h3>₹--</h3>
                                    <p>Today's Revenue</p>
                                </div>
                            </div>
                            <div className="tm-stat-card">
                                <div className="tm-stat-icon">🎟️</div>
                                <div className="tm-stat-info">
                                    <h3>--</h3>
                                    <p>Today's Bookings</p>
                                </div>
                            </div>
                        </div>

                        <div className="tm-quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="tm-action-buttons">
                                <button 
                                    className="tm-action-btn"
                                    onClick={() => setActiveTab('movies')}
                                >
                                    ➕ Add New Movie
                                </button>
                                <button 
                                    className="tm-action-btn"
                                    onClick={() => setActiveTab('showtimes')}
                                >
                                    🕒 Schedule Showtime
                                </button>
                                <button className="tm-action-btn">
                                    📊 View Reports
                                </button>
                                <button className="tm-action-btn">
                                    🎟️ Check Bookings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Movies Management */}
                {activeTab === 'movies' && (
                    <div className="tm-movies-management">
                        <div className="tm-section-header">
                            <h2>🎬 Movie Management</h2>
                            <button className="tm-refresh-btn" onClick={fetchMovies}>
                                🔄 Refresh
                            </button>
                        </div>

                        {/* Movie Form */}
                        <div className="tm-form-container">
                            <h3>Add New Movie</h3>
                            <form onSubmit={handleMovieSubmit} className="tm-movie-form">
                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Movie Title *</label>
                                        <input
                                            type="text"
                                            value={movieForm.title}
                                            onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                                            required
                                            placeholder="Enter movie title"
                                        />
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Genre *</label>
                                        <select
                                            value={movieForm.genre}
                                            onChange={(e) => setMovieForm({...movieForm, genre: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Genre</option>
                                            <option value="Action">Action</option>
                                            <option value="Comedy">Comedy</option>
                                            <option value="Drama">Drama</option>
                                            <option value="Thriller">Thriller</option>
                                            <option value="Horror">Horror</option>
                                            <option value="Romance">Romance</option>
                                            <option value="Sci-Fi">Sci-Fi</option>
                                            <option value="Animation">Animation</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Duration (minutes) *</label>
                                        <input
                                            type="number"
                                            value={movieForm.duration}
                                            onChange={(e) => setMovieForm({...movieForm, duration: e.target.value})}
                                            required
                                            min="60"
                                            max="240"
                                            placeholder="e.g., 150"
                                        />
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Release Date *</label>
                                        <input
                                            type="date"
                                            value={movieForm.releaseDate}
                                            onChange={(e) => setMovieForm({...movieForm, releaseDate: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Language *</label>
                                        <input
                                            type="text"
                                            value={movieForm.language}
                                            onChange={(e) => setMovieForm({...movieForm, language: e.target.value})}
                                            required
                                            placeholder="e.g., English, Hindi"
                                        />
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Rating *</label>
                                        <select
                                            value={movieForm.rating}
                                            onChange={(e) => setMovieForm({...movieForm, rating: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Rating</option>
                                            <option value="U">U (Universal)</option>
                                            <option value="UA">UA (Parental Guidance)</option>
                                            <option value="A">A (Adults Only)</option>
                                            <option value="S">S (Restricted)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="tm-form-group">
                                    <label>Director</label>
                                    <input
                                        type="text"
                                        value={movieForm.director}
                                        onChange={(e) => setMovieForm({...movieForm, director: e.target.value})}
                                        placeholder="Director's name"
                                    />
                                </div>

                                <div className="tm-form-group">
                                    <label>Cast</label>
                                    <input
                                        type="text"
                                        value={movieForm.cast}
                                        onChange={(e) => setMovieForm({...movieForm, cast: e.target.value})}
                                        placeholder="Main cast members (comma separated)"
                                    />
                                </div>

                                <div className="tm-form-group">
                                    <label>Synopsis</label>
                                    <textarea
                                        value={movieForm.synopsis}
                                        onChange={(e) => setMovieForm({...movieForm, synopsis: e.target.value})}
                                        rows="4"
                                        placeholder="Enter movie plot/synopsis..."
                                    />
                                </div>

                                <div className="tm-form-group">
                                    <label>Trailer URL</label>
                                    <input
                                        type="url"
                                        value={movieForm.trailerUrl}
                                        onChange={(e) => setMovieForm({...movieForm, trailerUrl: e.target.value})}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>

                                <div className="tm-form-group">
                                    <label>Movie Poster *</label>
                                    <div className="tm-file-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                        />
                                        {movieForm.posterPreview && (
                                            <div className="tm-poster-preview">
                                                <img src={movieForm.posterPreview} alt="Poster Preview" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="tm-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding Movie...' : 'Add Movie'}
                                </button>
                            </form>
                        </div>

                        {/* Movies List */}
                        <div className="tm-movies-list">
                            <h3>Current Movies ({movies.length})</h3>
                            {movies.length === 0 ? (
                                <div className="tm-empty-state">
                                    <p>No movies added yet. Add your first movie above.</p>
                                </div>
                            ) : (
                                <div className="tm-movies-grid">
                                    {movies.map(movie => (
                                        <div key={movie.id} className="tm-movie-card">
                                            <div className="tm-movie-poster">
                                                <img 
                                                    src={movie.posterUrl || 'https://via.placeholder.com/200x300'} 
                                                    alt={movie.title} 
                                                />
                                            </div>
                                            <div className="tm-movie-info">
                                                <h4>{movie.title}</h4>
                                                <div className="tm-movie-details">
                                                    <span className="tm-movie-genre">{movie.genre}</span>
                                                    <span className="tm-movie-duration">{movie.duration} min</span>
                                                    <span className="tm-movie-rating">{movie.rating}</span>
                                                </div>
                                                <p className="tm-movie-language">{movie.language}</p>
                                                <p className="tm-movie-release">
                                                    Release: {new Date(movie.releaseDate).toLocaleDateString()}
                                                </p>
                                                <div className="tm-movie-actions">
                                                    <button className="tm-action-btn edit">✏️ Edit</button>
                                                    <button 
                                                        className="tm-action-btn delete"
                                                        onClick={() => deleteMovie(movie.id)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                    <button className="tm-action-btn schedule">
                                                        🕒 Schedule Show
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Showtimes Management */}
                {activeTab === 'showtimes' && (
                    <div className="tm-showtimes-management">
                        <div className="tm-section-header">
                            <h2>🕒 Showtime Management</h2>
                        </div>

                        {/* Showtime Form */}
                        <div className="tm-form-container">
                            <h3>Add New Showtime</h3>
                            <form onSubmit={handleShowtimeSubmit} className="tm-showtime-form">
                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Movie *</label>
                                        <select
                                            value={showtimeForm.movieId}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, movieId: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Movie</option>
                                            {movies.map(movie => (
                                                <option key={movie.id} value={movie.id}>
                                                    {movie.title} ({movie.language})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Screen Number *</label>
                                        <input
                                            type="text"
                                            value={showtimeForm.screen}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, screen: e.target.value})}
                                            required
                                            placeholder="e.g., Screen 1"
                                        />
                                    </div>
                                </div>

                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Date *</label>
                                        <input
                                            type="date"
                                            value={showtimeForm.date}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, date: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Time *</label>
                                        <input
                                            type="time"
                                            value={showtimeForm.time}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, time: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="tm-form-row">
                                    <div className="tm-form-group">
                                        <label>Adult Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={showtimeForm.priceAdult}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, priceAdult: e.target.value})}
                                            required
                                            min="100"
                                            placeholder="e.g., 250"
                                        />
                                    </div>
                                    <div className="tm-form-group">
                                        <label>Child Price (₹) *</label>
                                        <input
                                            type="number"
                                            value={showtimeForm.priceChild}
                                            onChange={(e) => setShowtimeForm({...showtimeForm, priceChild: e.target.value})}
                                            required
                                            min="50"
                                            placeholder="e.g., 150"
                                        />
                                    </div>
                                </div>

                                <div className="tm-form-group">
                                    <label>Available Seats *</label>
                                    <input
                                        type="number"
                                        value={showtimeForm.availableSeats}
                                        onChange={(e) => setShowtimeForm({...showtimeForm, availableSeats: e.target.value})}
                                        required
                                        min="1"
                                        max="300"
                                        placeholder="Total seats available"
                                    />
                                </div>

                                <button type="submit" className="tm-submit-btn">
                                    Add Showtime
                                </button>
                            </form>
                        </div>

                        {/* Showtimes List */}
                        <div className="tm-showtimes-list">
                            <h3>Scheduled Showtimes ({showtimes.length})</h3>
                            {showtimes.length === 0 ? (
                                <div className="tm-empty-state">
                                    <p>No showtimes scheduled yet.</p>
                                </div>
                            ) : (
                                <div className="tm-showtimes-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Movie</th>
                                                <th>Date & Time</th>
                                                <th>Screen</th>
                                                <th>Adult Price</th>
                                                <th>Child Price</th>
                                                <th>Available Seats</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {showtimes.map(showtime => {
                                                const movie = movies.find(m => m.id === showtime.movieId);
                                                return (
                                                    <tr key={showtime.id}>
                                                        <td>{movie?.title || 'Unknown'}</td>
                                                        <td>
                                                            {new Date(showtime.date).toLocaleDateString()} 
                                                            <br />
                                                            {showtime.time}
                                                        </td>
                                                        <td>{showtime.screen}</td>
                                                        <td>₹{showtime.priceAdult}</td>
                                                        <td>₹{showtime.priceChild}</td>
                                                        <td>{showtime.availableSeats}</td>
                                                        <td>
                                                            <div className="tm-table-actions">
                                                                <button className="tm-action-btn edit">✏️</button>
                                                                <button 
                                                                    className="tm-action-btn delete"
                                                                    onClick={() => deleteShowtime(showtime.id)}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pricing Management */}
                {activeTab === 'pricing' && (
                    <div className="tm-pricing-management">
                        <h2>💰 Pricing Management</h2>
                        <div className="tm-pricing-form">
                            <h3>ODC (Other Day Categories) Pricing</h3>
                            <form>
                                <div className="tm-price-category">
                                    <h4>Weekday Pricing</h4>
                                    <div className="tm-form-row">
                                        <div className="tm-form-group">
                                            <label>Adult Price (₹)</label>
                                            <input type="number" defaultValue="200" />
                                        </div>
                                        <div className="tm-form-group">
                                            <label>Child Price (₹)</label>
                                            <input type="number" defaultValue="120" />
                                        </div>
                                    </div>
                                </div>

                                <div className="tm-price-category">
                                    <h4>Weekend Pricing</h4>
                                    <div className="tm-form-row">
                                        <div className="tm-form-group">
                                            <label>Adult Price (₹)</label>
                                            <input type="number" defaultValue="250" />
                                        </div>
                                        <div className="tm-form-group">
                                            <label>Child Price (₹)</label>
                                            <input type="number" defaultValue="150" />
                                        </div>
                                    </div>
                                </div>

                                <div className="tm-price-category">
                                    <h4>Special Show Pricing (3D/IMAX)</h4>
                                    <div className="tm-form-row">
                                        <div className="tm-form-group">
                                            <label>3D Adult (₹)</label>
                                            <input type="number" defaultValue="300" />
                                        </div>
                                        <div className="tm-form-group">
                                            <label>3D Child (₹)</label>
                                            <input type="number" defaultValue="200" />
                                        </div>
                                        <div className="tm-form-group">
                                            <label>IMAX Adult (₹)</label>
                                            <input type="number" defaultValue="350" />
                                        </div>
                                        <div className="tm-form-group">
                                            <label>IMAX Child (₹)</label>
                                            <input type="number" defaultValue="250" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="tm-submit-btn">
                                    Save Pricing
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reports */}
                {activeTab === 'reports' && (
                    <div className="tm-reports">
                        <h2>📈 Reports & Analytics</h2>
                        <div className="tm-reports-grid">
                            <div className="tm-report-card">
                                <h4>Revenue Report</h4>
                                <p>View daily, weekly, and monthly revenue</p>
                                <button className="tm-action-btn">View Report</button>
                            </div>
                            <div className="tm-report-card">
                                <h4>Booking Analytics</h4>
                                <p>Analyze booking patterns and occupancy</p>
                                <button className="tm-action-btn">View Analytics</button>
                            </div>
                            <div className="tm-report-card">
                                <h4>Movie Performance</h4>
                                <p>See which movies are performing best</p>
                                <button className="tm-action-btn">View Performance</button>
                            </div>
                            <div className="tm-report-card">
                                <h4>Export Data</h4>
                                <p>Export reports in Excel/PDF format</p>
                                <button className="tm-action-btn">Export</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TheaterManagerDashboard;