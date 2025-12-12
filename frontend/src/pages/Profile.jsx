import React from "react";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { bookingAPI, paymentAPI, userAPI } from "../services/api";
import "../css/Profile.css";

function Profile() {
  const [activeSection, setActiveSection] = useState("editProfile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  
  // user profile data (load from auth if available)
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    dateOfBirth: "1990-01-01"
  });
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // redirect to login if not authenticated
      navigate('/login', { state: { redirectTo: '/profile' } });
      return;
    }
    setProfileData(prev => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email
    }));
    // fetch bookings and saved payment methods
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const data = await bookingAPI.getBookingsByUser(user.id);
        console.log('[Profile] Bookings fetched:', data);
        // bookingAPI should return an array or an object with bookings
        setBookingHistory(Array.isArray(data) ? data : (data.bookings || []));
      } catch (err) {
        console.error('[Profile] Failed to load bookings', err);
        setBookingHistory([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const data = await paymentAPI.getPaymentsByUser(user.id);
        console.log('[Profile] Payments fetched:', data);
        setPaymentsHistory(Array.isArray(data) ? data : (data.payments || []));
      } catch (err) {
        console.error('[Profile] Failed to load payments', err);
        setPaymentsHistory([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchBookings();
    fetchPayments();
  }, [user, navigate]);

  // Booking history and payment history loaded from backend
  const [bookingHistory, setBookingHistory] = useState([]);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
 
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Mock form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  

  // Form handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('No authenticated user to update.');
      return;
    }
    try {
      // send update to backend
      const updated = await userAPI.updateUser(user.id, {
        // email and dateOfBirth are intentionally excluded from profile updates
        name: profileData.name,
        phone: profileData.phone
      });

      console.log('Profile update response:', updated);

      // update auth context and localStorage
      const newUser = updated && updated.id ? updated : { ...user, ...profileData };
      // preserve the server/user email and DOB — don't allow client-side changes here
      if (user && user.email) newUser.email = user.email;
      if (user && user.dateOfBirth) newUser.dateOfBirth = user.dateOfBirth;
      setUser(newUser);
      try { localStorage.setItem('user', JSON.stringify(newUser)); } catch (e) { /* ignore */ }

      // reflect change in the current form state too
      setProfileData(prev => ({ ...prev, name: newUser.name, email: newUser.email, phone: newUser.phone, dateOfBirth: newUser.dateOfBirth }));

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('You must be logged in to change your password.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Please fill current and new password.');
      return;
    }

    (async () => {
      try {
        // Current backend accepts password on the generic update endpoint.
        // We build around existing service: send { password: newPassword } to PUT /api/users/{id}
        // Note: this backend method does not verify currentPassword — keep UX warning.
        const payload = { password: passwordData.newPassword };
        const updated = await userAPI.updateUser(user.id, payload);
        console.log('Password update response:', updated);
        alert('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        console.error('Change password failed', err);
        alert(err.message || 'Failed to change password');
      }
    })();
  };

  
  const handleDeleteProfile = () => {
   if (confirmText.toLowerCase() !== "delete my account") {
      alert("Please type 'delete my account' to confirm.");
      return;
    }

    if (!user || !user.id) {
      alert('No authenticated user to delete.');
      return;
    }

    (async () => {
      try {
        // Call backend to delete user account
        await userAPI.deleteUser(user.id);
        console.log('[Profile] User account deleted:', user.id);
        
        alert("Account deleted successfully!");
        setShowDeleteModal(false);
        setConfirmText("");
        
        // Clear authentication and redirect to home/login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        setUser(null);
        navigate('/login');
      } catch (err) {
        console.error('[Profile] Failed to delete account', err);
        alert(err.message || 'Failed to delete account');
      }
    })();
  };
  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="profile-picture">
            {profileData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h3>{profileData.name}</h3>
          <p>{profileData.email}</p>
        </div>
        
        <nav className="profile-nav">
          <button 
            className={`nav-item ${activeSection === "editProfile" ? "active" : ""}`}
            onClick={() => setActiveSection("editProfile")}
          >
            Edit Profile
          </button>
          <button 
            className={`nav-item ${activeSection === "changePassword" ? "active" : ""}`}
            onClick={() => setActiveSection("changePassword")}
          >
            Change Password
          </button>
          <button 
            className={`nav-item ${activeSection === "bookingHistory" ? "active" : ""}`}
            onClick={() => setActiveSection("bookingHistory")}
          >
            Booking History
          </button>
          <button 
            className={`nav-item ${activeSection === "paymentsHistory" ? "active" : ""}`}
            onClick={() => setActiveSection("paymentsHistory")}
          >
            Payments
          </button>
          
          <button 
            className="delete-profile-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑 Delete Profile
          </button>
        </nav>
      </div>
      
      <div className="profile-content">
        {activeSection === "editProfile" && (
          <div className="section">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="readonly-field">{profileData.email}</div>
                <small className="field-note">Email cannot be changed from the profile page.</small>
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date of Birth</label>
                <div className="readonly-field">{profileData.dateOfBirth}</div>
                <small className="field-note">Date of birth cannot be changed from the profile page.</small>
              </div>
              
              <button type="submit" className="save-btn">Update Profile</button>
            </form>
          </div>
        )}

        {activeSection === "changePassword" && (
          <div className="section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="save-btn">Change Password</button>
            </form>
          </div>
        )}
       
        {activeSection === "bookingHistory" && (
          <div className="section">
            <h2>Booking History</h2>
            {loadingBookings ? (
              <p>Loading booking history...</p>
            ) : bookingHistory.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="booking-list">
                {bookingHistory.map(booking => (
                  <div key={booking.bookingId || booking.id} className="booking-card">
                    <div className="booking-info">
                      <h4>Booking #{booking.bookingId || booking.id}</h4>
                      <div className="booking-details">
                        <p><strong>Movie ID:</strong> {booking.movieId}</p>
                        <p><strong>Showtime ID:</strong> {booking.showtimeId}</p>
                        <p><strong>Seats:</strong> {booking.seatsSelected}</p>
                        <p><strong>Adults:</strong> {booking.totalAdults}, <strong>Children:</strong> {booking.totalChildren}</p>
                      </div>
                    </div>
                    <div className="booking-actions">
                      <div className={`booking-status ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </div>
                      {booking.status === "CONFIRMED" && (
                        <button 
                          className="cancel-btn"
                          onClick={() => cancelBooking(booking.bookingId || booking.id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "paymentsHistory" && (
          <div className="section">
            <h2>Payments</h2>
            {loadingPayments ? (
              <p>Loading payments...</p>
            ) : paymentsHistory.length === 0 ? (
              <p>No payments found.</p>
            ) : (
              <div className="payments-list">
                {paymentsHistory.map(p => (
                  <div key={p.paymentId || p.id} className="payment-card">
                    <div><strong>Payment ID:</strong> {p.paymentId || p.id}</div>
                    <div><strong>Booking ID:</strong> {p.bookingId}</div>
                    <div><strong>Amount:</strong> LKR {parseFloat(p.amount).toFixed(2)}</div>
                    <div><strong>Method:</strong> {p.paymentMethod}</div>
                    <div><strong>Status:</strong> {p.paymentStatus}</div>
                    <div><strong>Transaction ID:</strong> {p.transactionId}</div>
                    <div><strong>Date:</strong> {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Your Account</h3>
            <p>
              This action cannot be undone. This will permanently delete your account, 
              booking history, and all associated data. Please type "delete my account" to confirm.
            </p>
            <input
              type="text"
              className="confirm-input"
              placeholder="Type 'delete my account' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="confirm-delete-btn"
                onClick={handleDeleteProfile}
                disabled={confirmText.toLowerCase() !== "delete my account"}
              >
                Delete Account Permanently
              </button>
              <button
                className="cancel-delete-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;