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
        // bookingAPI should return an array or an object with bookings
        setBookingHistory(Array.isArray(data) ? data : (data.bookings || []));
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const data = await paymentAPI.getPaymentsByUser(user.id);
        setPaymentsHistory(Array.isArray(data) ? data : (data.payments || []));
      } catch (err) {
        console.error('Failed to load payments', err);
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
  const [cardDetails, setCardDetails] = useState([]); // local saved cards (if you manage them separately)
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Mock form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: "",
    isDefault: false
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

  const handleAddCard = (e) => {
    e.preventDefault();
    const newCardData = {
      id: cardDetails.length + 1,
      cardNumber: newCard.cardNumber.slice(-4),
      expiry: newCard.expiry,
      cardType: "Visa", 
      isDefault: newCard.isDefault
    };

    // If setting as default, remove default from other cards
    if (newCard.isDefault) {
      setCardDetails(prev => prev.map(card => ({ ...card, isDefault: false })));
    }

    setCardDetails(prev => [...prev, newCardData]);
    alert("Card added successfully!");
    setNewCard({ cardNumber: "", expiry: "", cvv: "", cardholderName: "", isDefault: false });
  };

  const setDefaultCard = (cardId) => {
    setCardDetails(cards => 
      cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const deleteCard = (cardId) => {
    setCardDetails(cards => cards.filter(card => card.id !== cardId));
  };

  const cancelBooking = (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    // Call booking API to cancel
    (async () => {
      try {
        await bookingAPI.cancelBooking(bookingId);
        setBookingHistory(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
        alert(`Booking ${bookingId} cancelled successfully!`);
      } catch (err) {
        console.error('Cancel booking error', err);
        alert(err.message || 'Failed to cancel booking');
      }
    })();
  };
  const handleDeleteProfile = () => {
  if (confirmText.toLowerCase() === "delete my account") {
    alert("Account deleted successfully!");
    setShowDeleteModal(false);
    setConfirmText("");
  } else {
    alert("Please type 'delete my account' to confirm.");
  }
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
            className={`nav-item ${activeSection === "cardDetails" ? "active" : ""}`}
            onClick={() => setActiveSection("cardDetails")}
          >
            
        Card Details
        
          </button>
          <button 
            className="delete-profile-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete Profile
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
            <div className="booking-list">
              {bookingHistory.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <h4>{booking.movie}</h4>
                    <div className="booking-details">
                      <p><strong>Theater:</strong> {booking.theater}</p>
                      <p><strong>Date & Time:</strong> {booking.date} at {booking.time}</p>
                      <p><strong>Seats:</strong> {booking.seats.join(", ")}</p>
                      <p><strong>Total:</strong> ${booking.total}</p>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <div className={`booking-status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </div>
                    {booking.status === "Completed" && (
                      <button className="download-btn">
                        Download Ticket
                      </button>
                    )}
                    {booking.status === "Confirmed" && (
                      <button 
                        className="cancel-btn"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                  <div key={p.id} className="payment-card">
                    <div><strong>ID:</strong> {p.id}</div>
                    <div><strong>Booking:</strong> {p.bookingId}</div>
                    <div><strong>Amount:</strong> {p.amount}</div>
                    <div><strong>Method:</strong> {p.paymentMethod}</div>
                    <div><strong>Status:</strong> {p.status}</div>
                    <div><strong>Date:</strong> {new Date(p.createdAt || p.date || p.timestamp || Date.now()).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        
        {activeSection === "cardDetails" && (
          <div className="section">
            <h2>Card Details</h2>
           
            <div className="cards-list">
              {cardDetails.map(card => (
                <div key={card.id} className="card-item">
                  <div className="card-info">
                    <div className="card-header">
                      <div className="card-type">{card.cardType}</div>
                      {card.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <div className="card-number">**** **** **** {card.cardNumber}</div>
                    <div className="card-expiry">Expires: {card.expiry}</div>
                  </div>
                  <div className="card-actions">
                    {!card.isDefault && (
                      <button 
                        className="action-btn"
                        onClick={() => setDefaultCard(card.id)}
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteCard(card.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            
            <div className="add-card-form">
              <h3>Add New Card</h3>
              <form onSubmit={handleAddCard} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456" 
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                      maxLength="16"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={newCard.cardholderName}
                    onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="setDefault" 
                    checked={newCard.isDefault}
                    onChange={(e) => setNewCard({...newCard, isDefault: e.target.checked})}
                  />
                  <label htmlFor="setDefault">Set as default payment method</label>
                </div>
                
                <button type="submit" className="save-btn">Add Card</button>
              </form>
            </div>
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

