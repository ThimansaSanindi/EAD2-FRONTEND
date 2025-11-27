import "../css/MovieCard.css"

function MovieCard({ movie }) {
    return(
        <div className="movie-card">
            <div className="movie-poster">
                <img src={movie.poster} alt={movie.title} />
            </div>
            <div className="movie-details">
                <h3 className="movie-title">{movie.title}</h3>
                <p>{movie.language}</p>
            </div>
        </div>
    )
}

export default MovieCard;