import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { movieAPI } from "../services/api";
import "../css/Home.css";

// Default placeholder poster for movies without poster_url
const DEFAULT_POSTER = "/images/default_poster.jpg";

const GENRES = ["Action", "Adventure", "Horror", "Drama", "Sci-Fi", "War", "Comedy", "Romance", "Thriller", "Crime"];
const LANGUAGES = ["English", "Tamil", "Sinhala", "Korean", "Japanese"];

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch movies from API on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const allMovies = await movieAPI.getAllMovies();
        setMovies(allMovies || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const isAuth = useMemo(() => {
    try {
      return !!(localStorage.getItem('token') || localStorage.getItem('user') || localStorage.getItem('isAuthenticated') === 'true');
    } catch (e) {
      return false;
    }
  }, []);

  const handleMovieClick = (movieId) => {
    if (!isAuth) {
      navigate('/login', { state: { redirectTo: `/movie/${movieId}` } });
      return;
    }
    navigate(`/movie/${movieId}`);
  };

  // Separate movies by status
  const nowShowing = useMemo(() => {
    return movies.filter(m => m.status === 'NOW_SHOWING' || m.status === 'now_showing');
  }, [movies]);

  const upcoming = useMemo(() => {
    return movies.filter(m => m.status === 'COMING_SOON' || m.status === 'coming_soon');
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return nowShowing.filter(m => {
      const matchesSearch = !q || m.title.toLowerCase().includes(q);
      const movieGenres = (m.genre || "").split(",").map(g => g.trim());
      const matchesGenre = !selectedGenre || selectedGenre === 'All' || movieGenres.some(g => g.includes(selectedGenre));
      const matchesLanguage = !selectedLanguage || selectedLanguage === 'All' || (m.language || "").includes(selectedLanguage);
      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [nowShowing, searchTerm, selectedGenre, selectedLanguage]);

  const scroll = (selector, amount = 400) => {
    const container = document.querySelector(selector);
    if (container) container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const renderMovieCard = (movie, index) => {
    // Normalize movie object to work with API response
    // API returns: { movieId, title, genre, ... } or { movie, title, genre, ... }
    const movieId = movie.movieId || movie.movie || movie.id || index;
    const normalizedMovie = {
      ...movie,
      id: movieId,
      poster: movie.poster_url || movie.posterUrl || movie.poster || DEFAULT_POSTER,
      genre: Array.isArray(movie.genre) ? movie.genre : (movie.genre || "").split(",").map(g => g.trim())
    };
    
    return (
      <div
        key={`movie-${movieId}`}
        className="movie-card-wrapper"
        onClick={() => handleMovieClick(movieId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMovieClick(movieId)}
        style={{ cursor: isAuth ? 'pointer' : 'not-allowed' }}
        title={isAuth ? `Open ${normalizedMovie.title}` : 'Sign in required to view details'}
      >
        <MovieCard movie={normalizedMovie} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="home">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="dropdowns-group">
        <div className="search-container">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn" type="button" onClick={() => {}}>Search</button>
          </form>
        </div>

        <div className="filter-group">
          <select className="filter-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <select className="filter-select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            <option value="">All Languages</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <h2>Now Showing ({filteredMovies.length})</h2>
      <div className="movies-scroll-wrapper">
        <button className="scroll-btn scroll-btn-left" onClick={() => scroll('.movies-scroll-container', -400)}>‹</button>
        <div className="movies-scroll-container">
          {filteredMovies.length > 0 ? filteredMovies.map((m, i) => renderMovieCard(m, i)) : <p style={{ padding: '1rem' }}>No movies found</p>}
        </div>
        <button className="scroll-btn scroll-btn-right" onClick={() => scroll('.movies-scroll-container', 400)}>›</button>
      </div>

      {upcoming.length > 0 && (
        <>
          <h2>Upcoming Movies ({upcoming.length})</h2>
          <div className="movies-scroll-wrapper">
            <button className="scroll-btn scroll-btn-left" onClick={() => scroll('.upcoming-scroll-container', -400)}>‹</button>
            <div className="upcoming-scroll-container">{upcoming.map((m, i) => renderMovieCard(m, i))}</div>
            <button className="scroll-btn scroll-btn-right" onClick={() => scroll('.upcoming-scroll-container', 400)}>›</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
