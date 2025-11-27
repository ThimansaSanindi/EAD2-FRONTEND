import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import "../css/Home.css";

import conjuringPoster from "../assets/conjuring_last_rite.jpg";
import runningManPoster from "../assets/running_man.jpg";
import tronAresPoster from "../assets/tron_ares.jpg";
import jurassicPoster from "../assets/jurassic_world.jpg";
import oneBattlePoster from "../assets/one_battle_after_another.jpg";
import regrettingYouPoster from "../assets/regretting_you.jpg";
import neeraPoster from "../assets/neera.jpg";
import ayuPoster from "../assets/ayu.jpg";
import kaanthaPoster from "../assets/kaantha.jpg";
import dudePoster from "../assets/dude.jpg";
import avatarPoster from "../assets/avatars.jpg";
import avengersPoster from "../assets/avengers.jpg";

// Static data (kept at module level to keep component small)
const MOVIES = [
  { id: 1, title: "The Conjuring", language: "English", poster: conjuringPoster, genre: ["Horror", "Thriller"] },
  { id: 2, title: "The Running Man", language: "English", poster: runningManPoster, genre: ["Action", "Sci-Fi"] },
  { id: 3, title: "Jurassic World: Rebirth", language: "English", poster: jurassicPoster, genre: ["Adventure", "Sci-Fi"] },
  { id: 4, title: "One Battle After Another", language: "English", poster: oneBattlePoster, genre: ["War", "Drama"] },
  { id: 5, title: "Tron: Ares", language: "English", poster: tronAresPoster, genre: ["Action", "Adventure"] },
  { id: 6, title: "Regretting You", language: "English", poster: regrettingYouPoster, genre: ["Drama", "Romance"] },
  { id: 7, title: "Neera", language: "Sinhala", poster: neeraPoster, genre: ["Drama", "Romance"] },
  { id: 8, title: "Ayu", language: "Sinhala", poster: ayuPoster, genre: ["Drama", "Romance"] },
  { id: 9, title: "Kaantha", language: "Tamil", poster: kaanthaPoster, genre: ["Action", "Drama", "Romance"] },
  { id: 10, title: "Dude", language: "Tamil", poster: dudePoster, genre: ["Action", "Drama", "Romance"] }
];

const UPCOMING = [
  { id: 11, title: "Avatar: The New Frontier", poster: avatarPoster, genre: ["Sci-Fi"], language: "English", isUpcoming: true },
  { id: 12, title: "Avengers: Doomsday", poster: avengersPoster, genre: ["Action"], language: "English", isUpcoming: true }
];

const GENRES = ["Action", "Adventure", "Horror", "Drama", "Sci-Fi", "War", "Comedy", "Romance"];
const LANGUAGES = ["English", "Tamil", "Sinhala"];

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const navigate = useNavigate();

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

  const filteredMovies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return MOVIES.filter(m => {
      const matchesSearch = !q || m.title.toLowerCase().includes(q);
      const matchesGenre = !selectedGenre || selectedGenre === 'All' || m.genre.includes(selectedGenre);
      const matchesLanguage = !selectedLanguage || selectedLanguage === 'All' || m.language === selectedLanguage;
      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [searchTerm, selectedGenre, selectedLanguage]);

  const scroll = (selector, amount = 400) => {
    const container = document.querySelector(selector);
    if (container) container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const renderMovieCard = (movie) => (
    <div
      key={movie.id}
      className="movie-card-wrapper"
      onClick={() => handleMovieClick(movie.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMovieClick(movie.id)}
      style={{ cursor: isAuth ? 'pointer' : 'not-allowed' }}
      title={isAuth ? `Open ${movie.title}` : 'Sign in required to view details'}
    >
      <MovieCard movie={movie} />
    </div>
  );

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

      <h2>Now Showing</h2>
      <div className="movies-scroll-wrapper">
        <button className="scroll-btn scroll-btn-left" onClick={() => scroll('.movies-scroll-container', -400)}>‹</button>
        <div className="movies-scroll-container">{filteredMovies.map(renderMovieCard)}</div>
        <button className="scroll-btn scroll-btn-right" onClick={() => scroll('.movies-scroll-container', 400)}>›</button>
      </div>

      <h2>Upcoming Movies</h2>
      <div className="movies-scroll-wrapper">
        <button className="scroll-btn scroll-btn-left" onClick={() => scroll('.upcoming-scroll-container', -400)}>‹</button>
        <div className="upcoming-scroll-container">{UPCOMING.map(renderMovieCard)}</div>
        <button className="scroll-btn scroll-btn-right" onClick={() => scroll('.upcoming-scroll-container', 400)}>›</button>
      </div>
    </div>
  );
}

export default Home;
