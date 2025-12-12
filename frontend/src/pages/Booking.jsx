import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { seatAPI } from "../services/api";
import "../css/Booking.css";

// Simple seat map generator
const makeSeatRows = (rows = 8, cols = 6) => {
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
  // OR: { movie, showtime, date } - we need to handle both
  const { movie, cinema, show, date, showtime } = location.state || {};

  // Use showtime if available, otherwise use show/cinema
  const actualShowtime = showtime || show;
  const actualCinema = cinema || (showtime ? {
    cinema: showtime.theater_name || `Theater ${showtime.theater_id}`,
    location: showtime.theater_location || "Unknown Location"
  } : null);

  // REAL DATA - No fallbacks
  const movieTitle = movie?.title;
  const movieLang = movie?.language || "English";
  const cinemaName = actualCinema?.cinema || actualCinema?.name;
  const cinemaLocation = actualCinema?.location;
  const showTime = actualShowtime?.time || 
                   (actualShowtime?.show_time ? 
                    new Date(actualShowtime.show_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                    null);
  const showDate = date || new Date().toISOString().split("T")[0];
  const showtimeId = actualShowtime?.id;

  // State for REAL seat data
  const [loading, setLoading] = useState(true);
  const [seatData, setSeatData] = useState(null);
  const [reservedSeats, setReservedSeats] = useState(new Set());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState({ rows: 8, cols: 6 });

  // Fetch REAL seat availability
  useEffect(() => {
    const fetchSeatData = async () => {
      if (!showtimeId) {
        console.error("No showtimeId available!");
        alert("Showtime information is missing. Please go back and select a showtime.");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        console.log("[Booking] Fetching seat data for showtimeId:", showtimeId);
        
        const data = await seatAPI.getSeatAvailability(showtimeId);
        console.log("[Booking] Seat data received:", data);
        
        setSeatData(data);
        setReservedSeats(new Set(data.reservedSeats || []));
        setSeatLayout(data.layout || { rows: 8, cols: 6 });
        
      } catch (error) {
        console.error("[Booking] Failed to fetch seat data:", error);
        alert("Failed to load seat availability. Please try again.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, [showtimeId, navigate]);

  // Seat map based on REAL layout
  const seatRows = useMemo(() => makeSeatRows(seatLayout.rows, seatLayout.cols), [seatLayout]);

  // Existing feature: Seat selection
  const toggleSeat = (seatId) => {
    if (reservedSeats.has(seatId)) return; // can't select reserved
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((s) => s !== seatId);
      return [...prev, seatId];
    });
  };

  // Existing feature: Proceed to category modal
  const proceed = () => {
    if (selectedSeats.length === 0) return;
    setCategoryModalOpen(true);
  };

  // Existing feature: Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const seatsCount = selectedSeats.length || 0;
  const [qtyFull, setQtyFull] = useState(0);
  const [qtyHalf, setQtyHalf] = useState(0);

  const totalQty = qtyFull + qtyHalf;
  // Must equal exactly the number of selected seats
  const canConfirm = totalQty === seatsCount && seatsCount > 0;

  // Existing feature: Quantity adjustment
  const handleQtyFullChange = (val) => {
    const newFull = Math.max(0, Math.min(seatsCount, Number(val || 0)));
    setQtyFull(newFull);
    setQtyHalf(Math.max(0, seatsCount - newFull));
  };

  // Existing feature: Quantity adjustment
  const handleQtyHalfChange = (val) => {
    const newHalf = Math.max(0, Math.min(seatsCount, Number(val || 0)));
    setQtyHalf(newHalf);
    setQtyFull(Math.max(0, seatsCount - newHalf));
  };

  // Existing feature: Confirm categories and navigate to payment
  const handleConfirmCategories = () => {
    if (!canConfirm) return;
    
    // Use REAL pricing if available from showtime, otherwise use defaults
    const basePrice = actualShowtime?.price || 1100;
    const halfPrice = Math.round(basePrice * 0.77); // ~850 for 1100 base
    
    navigate("/payment", {
      state: {
        movie,
        cinema: actualCinema,
        show: actualShowtime,
        date: showDate,
        seats: selectedSeats,
        categories: {
          odcFull: { qty: qtyFull, price: basePrice },
          odcHalf: { qty: qtyHalf, price: halfPrice }
        },
        showtimeId: showtimeId, // Pass showtimeId for booking creation
        movieId : movie?.id || movie?.movieId// Pass movieId for booking creation
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Loading Seat Availability</h3>
          <p>Please wait while we fetch available seats...</p>
        </div>
      </div>
    );
  }

  // Error state - missing required data
  if (!movieTitle || !cinemaName || !showTime) {
    return (
      <div className="booking-page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Invalid Booking Request</h2>
          <p>Required information is missing. Please go back and select a showtime.</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

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
          {seatData && (
            <div className="available-info">Available: {seatData.availableSeats?.length || 0} seats</div>
          )}
        </div>
      </header>

      <main className="booking-main">
        <div className="seats-wrapper">
          {/* Split rows into two columns - EXISTING FEATURE */}
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
                          const isReserved = reservedSeats.has(id);
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
                          const isReserved = reservedSeats.has(id);
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

      {/* Category selection modal - EXISTING FEATURE */}
      {categoryModalOpen && (
        <div className="category-modal-overlay">
          <div className="category-modal">
            <h3>Select Category</h3>

            <div className="category-row">
              <div className="cat-info">
                <div className="cat-title">ODC FULL</div>
                <div className="cat-price">
                  LKR {(actualShowtime?.price || 1100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
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
                <div className="cat-price">
                  LKR {Math.round((actualShowtime?.price || 1100) * 0.77).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
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
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}