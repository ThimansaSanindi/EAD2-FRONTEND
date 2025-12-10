import React from 'react';
import { useParams } from 'react-router-dom';

function Booking() {
  const { id } = useParams();
  return (
    <div className="booking-page">
      <h2>Booking</h2>
      <p>Booking flow / placeholder for movie id: {id}</p>
    </div>
  );
}

export default Booking;
