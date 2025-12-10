import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { movieAPI, showtimeAPI } from "../services/api";
import "../css/MovieDescription.css";

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getNextDays = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

function MovieDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const movieData = await movieAPI.getMovieById(id);
        console.log('[MovieDescription] Movie fetched:', movieData);
        setMovie(movieData);
        
        const showtimeData = await showtimeAPI.getShowtimesByMovie(id);
        console.log('[MovieDescription] Showtimes fetched:', showtimeData);
        console.log('[MovieDescription] Showtimes count:', showtimeData?.length || 0);
        console.log('[MovieDescription] Full showtime array:', JSON.stringify(showtimeData, null, 2));
        const stArray = Array.isArray(showtimeData) ? showtimeData : [];
        setShowtimes(stArray);

        // If the current selected date doesn't match any returned showtime dates,
        // fallback to the first available showtime date so something is visible.
        const availableDates = stArray.map(s => {
          const raw = s?.show_time || s?.showTime || s?.showtime || s?.start_time || s?.startTime;
          const d = raw ? new Date(raw) : null;
          return d && !isNaN(d) ? d.toISOString().split('T')[0] : null;
        }).filter(Boolean);

        if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
          setSelectedDate(availableDates[0]);
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getShowISO = (st) => {
    const raw = st?.show_time || st?.showTime || st?.showtime || st?.start_time || st?.startTime;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d)) return null;
    return d.toISOString();
  };

  const formatShowTime = (st) => {
    const iso = getShowISO(st);
    if (!iso) return 'TBD';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBookTickets = (showtime) => {
    setPendingBooking(showtime);
    setTermsOpen(true);
  };

  const acceptTermsAndProceed = () => {
    if (!pendingBooking) return;
    setTermsOpen(false);
    navigate(`/booking/${id}`, { state: { movie, showtime: pendingBooking, date: selectedDate } });
    setPendingBooking(null);
  };

  const cancelTerms = () => {
    setTermsOpen(false);
    setPendingBooking(null);
  };

  if (loading) {
    return (
      <div className="movie-description-page">
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-description-page">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Movies</button>
        <p style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
          {error || 'Movie not found'}
        </p>
      </div>
    );
  }

  const dates = getNextDays();
  const posterUrl = movie.poster_url || movie.posterUrl || '/images/default_poster.jpg';

  return (
    <div className="movie-description-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Movies</button>

      <div className="movie-header">
        <h1>{movie.title}</h1>
        <div className="poster-and-storyline">
          <div className="poster-section">
            <div className="movie-poster-large">
              <img src={posterUrl} alt={movie.title} onError={(e) => e.target.src = '/images/default_poster.jpg'} />
            </div>
          </div>
          <div className="storyline-section">
            <h2>Storyline</h2>
            <p>{movie.description || 'No description available'}</p>
            <div className="movie-meta">
              <span>⏱️ {formatDuration(movie.duration)}</span>
              <span>🎭 {movie.genre || 'N/A'}</span>
              <span>📅 {movie.release_date || movie.releaseDate || 'N/A'}</span>
              <span>⭐ {movie.rating || 'N/A'}</span>
              <span>🗣️ {movie.language || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {movie.cast && (
        <section className="cast-section">
          <h2>Cast & Crew</h2>
          <p><strong>Cast:</strong> {movie.cast}</p>
        </section>
      )}

      {movie.status !== 'COMING_SOON' && movie.status !== 'coming_soon' && (
        <section className="showtimes-section">
          <h2>Showtimes & Tickets</h2>
          <div className="date-selector">
            {dates.map(date => (
              <button
                key={date}
                className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>

          {showtimes && showtimes.length > 0 ? (
            (() => {
              const filtered = showtimes.filter(st => {
                const iso = getShowISO(st);
                if (!iso) return false;
                return iso.split('T')[0] === selectedDate;
              });

              if (filtered.length === 0) {
                return <p style={{ textAlign: 'center', padding: '2rem' }}>No showtimes available for the selected date</p>;
              }

              return (
                <div className="cinemas-list">
                  {filtered.map((showtime, idx) => {
                    const keyId = showtime.id ?? showtime.showtime_id ?? showtime._id ?? idx;
                    const theaterName = showtime.theater_name || showtime.theaterName || `Theater ${showtime.theater_id || showtime.theaterId || ''}`;
                    const theaterLocation = showtime.theater_location || showtime.theaterLocation || '';
                    const timeLabel = formatShowTime(showtime);
                    const priceLabel = (showtime.price !== undefined && showtime.price !== null) ? `₦${showtime.price}` : '';

                    return (
                      <div key={keyId} className="cinema-card">
                        <div className="cinema-info">
                          <h3>{theaterName}</h3>
                          <p className="location">{theaterLocation}</p>
                        </div>
                        <button
                          className="showtime-btn"
                          onClick={() => handleBookTickets(showtime)}
                        >
                          <span className="time">{timeLabel}</span>
                          <span className="type">{showtime.format || 'Standard'}</span>
                          <span className="price">{priceLabel}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem' }}>No showtimes available for this movie</p>
          )}
        </section>
      )}

      {(movie.status === 'COMING_SOON' || movie.status === 'coming_soon') && (
        <section className="showtimes-section">
          <h2>Coming Soon</h2>
          <p style={{ textAlign: 'center', padding: '2rem' }}>This movie is coming soon. Showtimes will be available soon.</p>
        </section>
      )}

      {termsOpen && (
        <div className="terms-modal-overlay">
          <div className="terms-modal">
            <h3>Notes</h3>
            <p>Dear Cinema Patron, to ensure your safety, kindly bear with the security procedures.</p>
            <ol>
              <li>Baggage counter facility will be provided for bags and backpacks.</li>
              <li>No Loitering.</li>
              <li>No outside food allowed in the cinema.</li>
              <li>Once the ticket is booked, cinema does not allow us to modify the booking or cancel it.</li>
              <li>Please check the show date-time on order summary and payment page before making the payment.</li>
              <li>As per the Government policy, consumption of food & beverage inside the auditorium is not allowed.</li>
            </ol>

            <div className="terms-actions">
              <button className="btn cancel" onClick={cancelTerms}>Cancel</button>
              <button className="btn accept" onClick={acceptTermsAndProceed}>Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDescription;
