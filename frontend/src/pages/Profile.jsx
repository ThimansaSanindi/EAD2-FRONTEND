import React from "react";
import { useState } from "react";
import "../css/Profile.css";

function Profile() {
  const [activeSection, setActiveSection] = useState("editProfile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  
  // Mock user data
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    dateOfBirth: "1990-01-01"
  });

  // Mock booking history
  const [bookingHistory] = useState([
    { 
      id: 1, 
      movie: "The Conjuring", 
      date: "2024-01-15", 
      time: "18:30",
      seats: ["A1", "A2"], 
      total: 24.00, 
      status: "Completed",
      theater: "PVR Cinemas"
    },
    { 
      id: 2, 
      movie: "Jurassic World: Rebirth", 
      date: "2024-01-10", 
      time: "21:00",
      seats: ["B3", "B4"], 
      total: 24.00, 
      status: "Completed",
      theater: "INOX"
    },
    { 
      id: 3, 
      movie: "The Running Man", 
      date: "2024-01-05", 
      time: "15:45",
      seats: ["C5", "C6"], 
      total: 22.00, 
      status: "Cancelled",
      theater: "Cinepolis"
    }
  ]);

  // Mock card details
  const [cardDetails, setCardDetails] = useState([
    { id: 1, cardNumber: "1234", expiry: "12/25", cardType: "Visa", isDefault: true },
    { id: 2, cardNumber: "5678", expiry: "08/26", cardType: "Mastercard", isDefault: false }
  ]);

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
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
    console.log("Updated profile:", profileData);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    alert("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      alert(`Booking ${bookingId} cancelled successfully!`);
      
    }
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
                <input 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  required
                />
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
                <input 
                  type="date" 
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                />
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

