import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Payment.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract booking data from state
  const { movie, cinema, show, date, seats, categories } = location.state || {};

  // Fallback values
  const movieTitle = movie?.title || "Movie";
  const movieLang = movie?.language || "English";
  const cinemaName = cinema?.cinema || "PVR Cinemas";
  const cinemaLocation = cinema?.location || "One Gall Face Mall";
  const showTime = show?.time || "09:00 AM";
  const showDate = date || new Date().toISOString().split("T")[0];
  const selectedSeats = seats || [];
  const odcFull = categories?.odcFull || { qty: 0, price: 1100 };
  const odcHalf = categories?.odcHalf || { qty: 0, price: 850 };

  // Calculate totals
  const ticketAmount = odcFull.qty * odcFull.price + odcHalf.qty * odcHalf.price;
  const vatRate = 0.08; // 8% VAT
  const vatAmount = Math.round(ticketAmount * vatRate * 100) / 100;
  const paidAmount = ticketAmount; // or could include VAT
  const totalAmount = ticketAmount + vatAmount;

  // Form state
  const [paymentMethod, setPaymentMethod] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
      alert("Please fill in all card details");
      return;
    }
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      alert(`Payment of LKR ${totalAmount.toFixed(2)} successful via ${paymentMethod.toUpperCase()}!`);
      navigate("/"); // Redirect to home after successful payment
      setIsProcessing(false);
    }, 1500);
  };

  const handleDecline = () => {
    if (window.confirm("Are you sure you want to decline this payment?")) {
      navigate(`/booking/${id}`, { state: { movie, cinema, show, date: showDate, seats: selectedSeats, categories } });
    }
  };

  return (
    <div className="payment-page">
      {/* Booking header */}
      <header className="payment-header">
        <div className="header-info">
          <div className="movie-info">{movieTitle} — {movieLang}</div>
          <div className="location">{cinemaLocation}</div>
          <div className="date-time">
            <span>{new Date(showDate).toLocaleDateString()}</span>
            <span className="separator">•</span>
            <span>{showTime}</span>
          </div>
        </div>
        <div className="selected-seats">Seats: {selectedSeats.join(", ")}</div>
      </header>

      <main className="payment-main">
        {/* Purchase Summary */}
        <section className="purchase-summary">
          <h3>Purchase Summary</h3>

          <div className="summary-items">
            <div className="summary-row">
              <span>ODC FULL Tickets</span>
              <span>{odcFull.qty} × LKR {odcFull.price.toFixed(2)}</span>
              <span className="amount">LKR {(odcFull.qty * odcFull.price).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>ODC HALF Tickets</span>
              <span>{odcHalf.qty} × LKR {odcHalf.price.toFixed(2)}</span>
              <span className="amount">LKR {(odcHalf.qty * odcHalf.price).toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Ticket Amount</span>
              <span></span>
              <span className="amount">LKR {ticketAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>VAT (8%)</span>
              <span></span>
              <span className="amount">LKR {vatAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row highlight">
              <span>Total Amount</span>
              <span></span>
              <span className="amount">LKR {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="payment-method">
          <h3>Payment Method</h3>
          <div className="method-selector">
            <label className={`method-option ${paymentMethod === "visa" ? "active" : ""}`}>
              <input
                type="radio"
                name="method"
                value="visa"
                checked={paymentMethod === "visa"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Visa</span>
            </label>
            <label className={`method-option ${paymentMethod === "mastercard" ? "active" : ""}`}>
              <input
                type="radio"
                name="method"
                value="mastercard"
                checked={paymentMethod === "mastercard"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Mastercard</span>
            </label>
          </div>
        </section>

        {/* Card Details Form */}
        <section className="card-details">
          <h3>Card Details</h3>
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                maxLength="16"
                required
              />
            </div>

            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    setCardExpiry(val);
                  }}
                  maxLength="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className="button-row">
              <button type="button" className="decline-btn" onClick={handleDecline} disabled={isProcessing}>
                Decline
              </button>
              <button type="submit" className="pay-btn" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay LKR ${totalAmount.toFixed(2)}`}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
