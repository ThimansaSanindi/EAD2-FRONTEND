import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import conjuringPoster from "../assets/conjuring_moie1.jpg";
import jurassicPoster from "../assets/jurassic_world_rebirth_movie.jpg";
import oneBattlePoster from "../assets/one_battle_after_another_movie.jpg";
import tronAresPoster from "../assets/tron_ares_movie.jpg";
import regrettingYouPoster from "../assets/regretting_you.jpg";
import neeraPoster from "../assets/Neera_movie.jpg";
import ayuPoster from "../assets/ayu_movie.jpg";
import dudePoster from "../assets/dude_movie.webp";
import kaanthaPoster from "../assets/kaantha_movie.jpg";
import avatarPoster from "../assets/avatar_movie.webp";
import avengersPoster from "../assets/avengers_movie.jpg";
import runningManPoster from "../assets/running_man_movie.jpg";
import "../css/MovieDescription.css";

// Poster map for cleaner access
const POSTERS = {
  1: conjuringPoster, 2: conjuringPoster, 3: jurassicPoster, 4: oneBattlePoster,
  5: tronAresPoster, 6: regrettingYouPoster, 7: neeraPoster, 8: ayuPoster,
  9: kaanthaPoster, 10: dudePoster, 11: avatarPoster, 12: avengersPoster
};

// Helper functions
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

const getShowtimesForDate = (cinema, selectedDate) => {
  const dayIndex = getNextDays().indexOf(selectedDate);
  const rotationMinutes = dayIndex * 30;
  const MIN_TIME = 9 * 60;
  const MAX_TIME = 21 * 60;
  const timeRange = MAX_TIME - MIN_TIME;

  const showtimes = cinema.shows.map((show) => {
    const [time, period] = show.time.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes = minutes;
    totalMinutes += rotationMinutes;
    
    while (totalMinutes > MAX_TIME) {
      totalMinutes = MIN_TIME + ((totalMinutes - MIN_TIME) % timeRange);
    }
    while (totalMinutes < MIN_TIME) {
      totalMinutes += timeRange;
    }

    let displayHours = Math.floor(totalMinutes / 60);
    let displayMinutes = totalMinutes % 60;
    const displayPeriod = displayHours >= 12 ? 'PM' : 'AM';
    displayHours = displayHours > 12 ? displayHours - 12 : (displayHours === 0 ? 12 : displayHours);

    return {
      time: `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')} ${displayPeriod}`,
      type: show.type,
      period: displayPeriod,
      sortHours: displayHours,
      totalMinutes
    };
  });

  const uniqueShowtimes = [];
  const seenTimes = new Set();
  showtimes.forEach(st => {
    if (!seenTimes.has(st.totalMinutes)) {
      seenTimes.add(st.totalMinutes);
      uniqueShowtimes.push(st);
    }
  });

  return uniqueShowtimes.sort((a, b) => 
    a.period !== b.period ? (a.period === 'AM' ? -1 : 1) : a.sortHours - b.sortHours
  );
};

function MovieDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null); // { cinema, show }

  // Mock data
  const movieData = {
    1: {
      id: 1,
      title: "The Conjuring",
      poster: conjuringPoster,
      duration: "2h 12m",
      genre: "Horror, Thriller",
      releaseDate: "01,nov,2025",
      synopsis: "Paranormal investigators Ed and Lorraine Warren confront their most terrifying case yet when a demonic entity follows a family to their new home",
      cast: ["Patrick Wilson, Vera Farmiga, Sterling Jerins"],
      imdbRating: 7.5,
      showtimes: [
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "3D" },
            { time: "09:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "2D" },
            { time: "09:00 PM", type: "2D" }
          ]
        },
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "2D" },
            { time: "09:00 PM", type: "IMAX" }
          ]
        }
      ]
    },
    2: {
      id: 2,
      title: "The Running Man",
      poster: runningManPoster,
      rating: "PG-13",
      duration: "1h 45m",
      genre: "Action, Sci-Fi",
      releaseDate: "06,nov,2025",
      synopsis: "In a dystopian future, a wrongly convicted man must compete in a deadly game show where contestants fight for their lives against professional killers.",
      cast: ["Chris Hemsworth, Michael B. Jordan, Florence Pugh"],
      imdbRating: 7.2,
      showtimes: [
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "3D" },
            { time: "09:00 PM", type: "3D" }
          ]
        }
      ]
    },
     3:{id: 3,
      title: "Jurassic World: Rebirth",
      poster: jurassicPoster,
     duration: "2h 12m",
      genre: "Adventure, Sci-Fi",
      releaseDate: "24,oct,2025",
      synopsis: "Scientists discover a way to resurrect dinosaurs through advanced genetic engineering, but the experiment goes terribly wrong on a remote island.",
      cast: ["Bryce Dallas Howard, Jeff Goldblum, Sam Neill"],
      imdbRating: 7.8,
      showtimes: [
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "10:30 AM", type: "2D" },
            { time: "03:30 PM", type: "3D" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "11:30 AM", type: "2D" },
            { time: "04:30 PM", type: "2D" }
          ]
        }
      ]
    },
     4:{id: 4,
      title: "One Battle After Another",
      poster: oneBattlePoster,
     duration: "2h 12m",
      genre: "Drama, War",
      releaseDate: "05,nov,2025",
      synopsis: "A former soldier struggles to adapt to civilian life while battling PTSD, only to be drawn into one final mission to save his family.",
      cast: ["Tom Hardy, Jodie Comer, Idris Elba"],
      imdbRating: 7.4,
      showtimes: [
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "IMAX" },
            { time: "06:00 PM", type: "IMAX" }
          ]
        },
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "3D" },
            { time: "07:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "11:00 AM", type: "2D" },
            { time: "05:00 PM", type: "2D" },
            { time: "08:00 PM", type: "2D" }
          ]
        }
      ]
    },
     5:{id: 5,
      title: "Tron: Ares",
      poster: tronAresPoster,
     duration: "2h 12m",
      genre: "Action, Adventure",
      releaseDate: "18,nov,2025",
      synopsis: "A brilliant video game developer finds himself transported into the digital world he created, where he must compete in deadly games to survive.",
      cast: ["Jared Leto, Greta Lee, Evan Peters"],
      imdbRating: 7.9,
      showtimes: [
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:00 PM", type: "3D" },
            { time: "09:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "10:30 AM", type: "2D" },
            { time: "04:30 PM", type: "IMAX" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "11:00 AM", type: "2D" },
            { time: "05:00 PM", type: "2D" }
          ]
        }
      ]
    },
     6:{id: 6,
      title: "Regretting You",
      poster: regrettingYouPoster,
     duration: "2h 12m",
      genre: "Romance, Drama",
      releaseDate: "26,oct,2025",
      synopsis: "Two former lovers cross paths after twenty years and must confront the choices that tore them apart and the lives they could have had.",
      cast: ["Rachel McAdams, Ryan Gosling, Viola Davis"],
      imdbRating: 7.3,
      showtimes: [
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "IMAX" },
            { time: "09:00 PM", type: "IMAX" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "2D" },
            { time: "09:00 PM", type: "2D" }
          ]
        },
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "3D" }
          ]
        }
      ]
    },
    7:{id: 7,
      title: "Neera",
      poster: neeraPoster,
     duration: "2h 12m",
      genre: "Romance, Drama",
      releaseDate: "10,nov,2025",
      synopsis: "Two former lovers cross paths after twenty years and must confront the choices that tore them apart and the lives they could have had.",
      cast: ["Shanudri Priyasad, Kasuni Kavindi, Udith Abeyrathne"],
      imdbRating: 7.6,
      showtimes: [
        {
          cinema: "Cityplex",
          location: "Central City Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "2D" },
            { time: "06:00 PM", type: "2D" }
          ]
        },
        {
          cinema: "SilverScreen",
          location: "Riverside Plaza",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "3D" },
            { time: "06:30 PM", type: "3D" }
          ]
        },
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "10:00 AM", type: "3D" },
            { time: "04:00 PM", type: "3D" }
          ]
        }
      ]
    },
    8:{id: 8,
      title: "Ayu",
      poster: ayuPoster,
     duration: "2h 12m",
      genre: "Romance, Drama",
      releaseDate: "10,nov,2025",
      synopsis: "A classical dancer fights to preserve her art form while navigating family expectations and modern societal pressures in contemporary India",
      cast: ["Sai Pallavi, Nani, Prakash Raj"],
      imdbRating: 7.7,
      director: "Buchi Babu Sana",
      showtimes: [
        {
          cinema: "Cityplex",
          location: "Central City Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "2D" },
            { time: "06:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "SilverScreen",
          location: "Riverside Plaza",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "3D" }
          ]
        },
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "IMAX" },
            { time: "07:00 PM", type: "IMAX" }
          ]
        }
      ]
    },
    9:{id: 9,
      title: "Kaantha",
      poster: kaanthaPoster,
     duration: "2h 15m",
      genre: "Romance, Drama, Action",
      releaseDate: "22,oct,2025",
      synopsis: "A mysterious vigilante emerges in a crime-ridden city, using unconventional methods to deliver justice where the system has failed.",
      cast: ["Vijay Sethupathi, Nayanthara, Fahadh Faasil"],
      imdbRating: 7.8,
      showtimes: [
        {
          cinema: "PVR Cinemas",
          location: "One Gall Face Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "3D" },
            { time: "09:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "2D" },
            { time: "08:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Regal Cinema",
          location: "Demetagoda",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "IMAX" },
            { time: "09:00 PM", type: "IMAX" }
          ]
        }
      ]
    },
    10:{id: 10,
      title: "Dude",
      poster: dudePoster,
     duration: "2h 8m",
      genre: "Romance, Drama, Action",
      releaseDate: "20,oct,2025",
      synopsis: "Four college friends reunite for a bachelor party that turns into an unexpected adventure, testing their friendship and life choices.",
      cast: ["Donald Glover, Seth Rogen, Jonah Hill"],
      imdbRating: 7.1,
      showtimes: [
        {
          cinema: "Cityplex",
          location: "Central City Mall",
          shows: [
            { time: "09:00 AM", type: "2D" },
            { time: "03:00 PM", type: "2D" },
            { time: "06:00 PM", type: "2D" }
          ]
        },
        {
          cinema: "SilverScreen",
          location: "Riverside Plaza",
          shows: [
            { time: "09:30 AM", type: "2D" },
            { time: "03:30 PM", type: "2D" },
            { time: "09:00 PM", type: "3D" }
          ]
        },
        {
          cinema: "Liberty Scope Cinema",
          location: "Kiribathgoda",
          shows: [
            { time: "10:00 AM", type: "2D" },
            { time: "04:00 PM", type: "2D" },
            { time: "09:00 PM", type: "3D" }
          ]
        }
      ]
    },
    11:{id: 11,
      title: "Avatar: The New Frontier",
      poster: avatarPoster,
     duration: "3h 0m",
      genre: "Sci-Fi, Adventure",
      releaseDate: "19,dec,2025",
      synopsis: "Jake Sully and the Na'vi explore new regions of Pandora, discovering ancient civilizations and facing unprecedented threats to their world.",
      cast: ["Sam Worthington, Zoe Saldana, Kate Winslet"],
      imdbRating: 8.2,
      comingSoon: true,
      showtimes: []
    },
    12:{id: 12,
      title: "Avengers: Doomsday",
      poster: avengersPoster,
     duration: "2h 45m",
      genre: "Sci-Fi, Action",
      releaseDate: "02,dec,2025",
      synopsis: "The Avengers face their greatest threat yet when a cosmic entity threatens to unravel reality itself, forcing heroes from across the universe to unite.",
      cast: ["Robert Downey Jr., Chris Evans, Brie Larson, Tom Hiddleston"],
      imdbRating: 8.5,
      comingSoon: true,
      showtimes: []
    }
    
  };

  const movie = movieData[id];
  const dates = getNextDays();

  if (!movie) return <div className="movie-description-page"><p>Movie not found</p></div>;

  const handleBookTickets = (cinema, show) => {
    // Open terms modal and store pending booking
    setPendingBooking({ cinema, show });
    setTermsOpen(true);
  };

  const acceptTermsAndProceed = () => {
    if (!pendingBooking) return;
    const { cinema, show } = pendingBooking;
    setTermsOpen(false);
    setPendingBooking(null);
    navigate(`/booking/${id}`, { state: { movie, cinema, show, date: selectedDate } });
  };

  const cancelTerms = () => {
    setTermsOpen(false);
    setPendingBooking(null);
    // stay on MovieDescription page 
  };

  return (
    <div className="movie-description-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Movies</button>

      <div className="movie-header">
        <h1>{movie.title}</h1>
        <div className="poster-and-storyline">
          <div className="poster-section">
            <div className="movie-poster-large">
              <img src={movie.poster} alt={movie.title} />
            </div>
          </div>
          <div className="storyline-section">
            <h2>Storyline</h2>
            <p>{movie.synopsis}</p>
            <div className="movie-meta">
              <span>⏱️ {movie.duration}</span>
              <span>🎭 {movie.genre}</span>
              <span>📅 {movie.releaseDate}</span>
              <span>⭐ IMDB: {movie.imdbRating}/10</span>
            </div>
          </div>
        </div>
      </div>

      <section className="cast-section">
        <h2>Cast & Crew</h2>
        <p><strong>Cast:</strong> {movie.cast.join(", ")}</p>
      </section>

      {!movie.comingSoon && (
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

          <div className="cinemas-list">
            {movie.showtimes.map((cinema, idx) => (
              <div key={idx} className="cinema-card">
                <div className="cinema-info">
                  <h3>{cinema.cinema}</h3>
                  <p className="location">{cinema.location}</p>
                </div>
                <div className="showtimes-grid">
                  {getShowtimesForDate(cinema, selectedDate).map((show, i) => (
                    <button key={i} className="showtime-btn" onClick={() => handleBookTickets(cinema, show)}>
                      <span className="time">{show.time}</span>
                      <span className="type">{show.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Terms & Conditions Modal */}
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
              <li>As per the Government policy, consumption of food &amp; beverage inside the auditorium is not allowed.</li>
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
