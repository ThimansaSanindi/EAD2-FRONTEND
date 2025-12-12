import "../css/MovieCard.css"
import posters from "../assets/posters/index.js";

function MovieCard({ movie }) {
    const placeholder = "https://via.placeholder.com/300x450?text=No+Poster";
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