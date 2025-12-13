import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import profileImg from "../assets/test-account.png";
import "../css/NavBar.css";
import { AuthContext } from "../contexts/AuthContext";

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = (user?.role || '').toUpperCase();
  const isManager = role === 'THEATER_MANAGER' || role === 'THEATRE_MANAGER' || role === 'MANAGER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {!isManager && <Link to="/" className="nav-link">Home</Link>}
        {isManager && <Link to="/theater-manager-dashboard" className="nav-link">Dashboard</Link>}
      </div>

      <div className="navbar-center">
      </div>

      <div className="navbar-right">
        <Link to="/" className="nav-link">Home</Link>

        {user ? (
          <>
            <span className="nav-link">Hi, {user.name || user.email}</span>
            <button className="nav-link signout-btn" onClick={handleLogout}>Sign Out</button>
            <Link to="/profile">
              <img src={profileImg} alt="User Profile" className="profile-icon" />
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/login">
              <img src={profileImg} alt="User Profile" className="profile-icon" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;