import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../css/Booking.css";

// Simple seat map generator
const makeSeatRows = (rows = 8, cols = 10) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const result = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 1; c <= cols; c++) {
      row.push({ id: `${letters[r]}${c}`, row: letters[r], number: c });
    }
    result.push(row);
  }
  return result;
};

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting state: { movie, cinema, show, date }
  const { movie, cinema, show, date } = location.state || {};

  // Fallback mock values if route state isn't provided
  const movieTitle = movie?.title || `Movie #${id || "?"}`;
  const movieLang = movie?.language || "English";
  const cinemaName = cinema?.cinema || (cinema?.name || "PVR Cinemas");
  const cinemaLocation = cinema?.location || "One Gall Face Mall";
  const showTime = show?.time || "09:00 AM";
  const showDate = date || new Date().toISOString().split("T")[0];

  // Seat map (8 rows x 6 columns)
  const seatRows = useMemo(() => makeSeatRows(8, 6), []);

  // Mock reserved seats (would come from backend normally) - adjusted for 6 columns
  const [reserved] = useState(new Set(["A1", "A2", "B5", "C6", "D4", "H6"]));
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatId) => {
    if (reserved.has(seatId)) return; // can't select reserved
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((s) => s !== seatId);
      return [...prev, seatId];
    });
  };

  const proceed = () => {
    if (selectedSeats.length === 0) return;
    // Open category selection modal before navigating to confirmation
    setCategoryModalOpen(true);
  };

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const seatsCount = selectedSeats.length || 0;
  const [qtyFull, setQtyFull] = useState(0);
  const [qtyHalf, setQtyHalf] = useState(0);

  const totalQty = qtyFull + qtyHalf;
  // Must equal exactly the number of selected seats
  const canConfirm = totalQty === seatsCount && seatsCount > 0;

  // When full quantity changes, adjust half to maintain total = seatsCount
  const handleQtyFullChange = (val) => {
    const newFull = Math.max(0, Math.min(seatsCount, Number(val || 0)));
    setQtyFull(newFull);
    setQtyHalf(Math.max(0, seatsCount - newFull));
  };

  // When half quantity changes, adjust full to maintain total = seatsCount
  const handleQtyHalfChange = (val) => {
    const newHalf = Math.max(0, Math.min(seatsCount, Number(val || 0)));
    setQtyHalf(newHalf);
    setQtyFull(Math.max(0, seatsCount - newHalf));
  };

  const handleConfirmCategories = () => {
    if (!canConfirm) return;
    // navigate to payment with category details
    navigate("/payment", {
      state: {
        movie,
        cinema,
        show,
        date: showDate,
        seats: selectedSeats,
        categories: {
          odcFull: { qty: qtyFull, price: 1100 },
          odcHalf: { qty: qtyHalf, price: 850 }
        }
      }
    });
  };

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="booking-title">
          <h2>{movieTitle} — {movieLang}</h2>
          <div className="cinema-line">{cinemaName}: <span className="location">{cinemaLocation}</span></div>
        </div>

        <div className="booking-meta">
          <div className="date">Date: <strong>{new Date(showDate).toLocaleDateString()}</strong></div>
          <div className="time">Time: <strong>{showTime}</strong></div>
        </div>
      </header>

      <main className="booking-main">
        <div className="seats-wrapper">
          {/* Split rows into two columns */}
          {(() => {
            const half = Math.ceil(seatRows.length / 2);
            const left = seatRows.slice(0, half);
            const right = seatRows.slice(half);
            return (
              <div className="seats-columns">
                <div className="seats-column left">
                  {left.map((row) => (
                    <div key={row[0].row} className="seat-row">
                      <div className="row-label">{row[0].row}</div>
                      <div className="row-seats">
                        {row.map((seat) => {
                          const id = seat.id;
                          const isReserved = reserved.has(id);
                          const isSelected = selectedSeats.includes(id);
                          const cls = isReserved ? "seat reserved" : isSelected ? "seat selected" : "seat available";
                          return (
                            <button
                              key={id}
                              className={cls}
                              onClick={() => toggleSeat(id)}
                              disabled={isReserved}
                              aria-pressed={isSelected}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="seats-column right">
                  {right.map((row) => (
                    <div key={row[0].row} className="seat-row">
                      <div className="row-label">{row[0].row}</div>
                      <div className="row-seats">
                        {row.map((seat) => {
                          const id = seat.id;
                          const isReserved = reserved.has(id);
                          const isSelected = selectedSeats.includes(id);
                          const cls = isReserved ? "seat reserved" : isSelected ? "seat selected" : "seat available";
                          return (
                            <button
                              key={id}
                              className={cls}
                              onClick={() => toggleSeat(id)}
                              disabled={isReserved}
                              aria-pressed={isSelected}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="screen">SCREEN — All eyes this way</div>

        <div className="legend">
          <div><span className="legend-box available" /> Available</div>
          <div><span className="legend-box selected" /> Selected</div>
          <div><span className="legend-box reserved" /> Reserved</div>
        </div>

        <div className="proceed-row">
          <div className="selected-summary">Selected: {selectedSeats.join(", ") || "None"}</div>
          <button
            className="proceed-btn"
            onClick={proceed}
            disabled={selectedSeats.length === 0}
            title={selectedSeats.length === 0 ? "Select at least one seat" : "Proceed to payment"}
          >
            Proceed
          </button>
        </div>
      </main>

      {/* Category selection modal */}
      {categoryModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            <h3>Select Category</h3>

            <div className="category-row">
              <div className="cat-info">
                <div className="cat-title">ODC FULL</div>
                <div className="cat-price">LKR 1,100.00</div>
              </div>
              <div className="cat-qty">
                <input
                  type="number"
                  min={0}
                  max={seatsCount}
                  value={qtyFull}
                  onChange={(e) => handleQtyFullChange(e.target.value)}
                />
              </div>
            </div>

            <div className="category-row">
              <div className="cat-info">
                <div className="cat-title">ODC HALF</div>
                <div className="cat-price">LKR 850.00</div>
              </div>
              <div className="cat-qty">
                <input
                  type="number"
                  min={0}
                  max={seatsCount}
                  value={qtyHalf}
                  onChange={(e) => handleQtyHalfChange(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-note">Total: {totalQty} / {seatsCount} seats</div>

            <div className="category-actions">
              <button className="btn cancel" onClick={() => setCategoryModalOpen(false)}>Cancel</button>
              <button className="btn accept" onClick={handleConfirmCategories} disabled={!canConfirm}>
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

