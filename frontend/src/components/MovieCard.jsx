import "../css/MovieCard.css"
import posters from "../assets/posters/index.js";

function MovieCard({ movie }) {
    
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23dfe3e6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='20'%3ENo Poster%3C/text%3E%3C/svg%3E";
    // Try assets manifest by id or slug, then explicit URL fields, else placeholder
    const byId = movie?.id != null ? posters[movie.id] : undefined;
    const byKey = movie?.slug ? posters[movie.slug] : undefined;
    const posterSrc = byId || byKey || movie?.posterUrl || movie?.poster || placeholder;

    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img
                    src={posterSrc}
                    alt={movie?.title || "Movie poster"}
                    onError={(e) => {
                        if (e.target.src !== placeholder) {
                            e.target.src = placeholder;
                        }
                    }}
                />
            </div>
            <div className="movie-details">
                <h3 className="movie-title">{movie?.title}</h3>
                <p>{movie?.language}</p>
            </div>
        </div>
    );
}

export default MovieCard;