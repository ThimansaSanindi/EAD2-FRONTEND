import { Link } from "react-router-dom";
import profileImg from "../assets/test-account.png";
import "../css/NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">Catch My Show</Link>
      </div>

      <div className="navbar-center">
      </div>

      <div className="navbar-right">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Sign In</Link>
        <Link to="/profile">
          <img src={profileImg} alt="User Profile" className="profile-icon" />
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;