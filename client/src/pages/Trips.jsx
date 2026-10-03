import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatDate, formatINR } from '../utils/format.js';

export default function Trips() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const load = () =>
    api
      .get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const cancel = async () => {
    try {
      await api.patch(`/bookings/${bookingToCancel._id}/cancel`);
      setBookingToCancel(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!bookings && !error) return <Loader />;

  return (
    <section>
      <h1>My Trips</h1>
      {location.state?.booked && <p className="success">Booking request sent to the host!</p>}
      {error && <p className="error">{error}</p>}
      {bookings?.length === 0 && (
        <p className="muted">No trips yet. <Link to="/">Find a stay</Link></p>
      )}
      {bookingToCancel && (
        <div className="confirmation-backdrop">
          <section
            className="card confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            aria-describedby="cancel-details"
            onKeyDown={(event) => { if (event.key === 'Escape') setBookingToCancel(null); }}
          >
            <h2 id="cancel-title">Cancel this trip?</h2>
            <p id="cancel-details">
              Cancel your stay at <strong>{bookingToCancel.listing?.title}</strong> from{' '}
              {formatDate(bookingToCancel.checkIn)} to {formatDate(bookingToCancel.checkOut)}?
            </p>
            <div className="row">
              <button className="btn btn-danger" onClick={cancel}>Yes, cancel trip</button>
              <button className="btn btn-ghost" autoFocus onClick={() => setBookingToCancel(null)}>Keep trip</button>
            </div>
          </section>
        </div>
      )}
      <div className="trip-list">
        {bookings?.map((b) => (
          <div key={b._id} className="card trip">
            <img src={b.listing?.images?.[0]} alt={b.listing?.title} />
            <div className="grow">
              <Link to={`/stays/${b.listing?._id}`}><strong>{b.listing?.title}</strong></Link>
              <p className="muted">{b.listing?.city}</p>
              <p>
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
            </div>
            <div className="trip-side">
              <span className={`status status-${b.status}`}>{b.status}</span>
              <strong>{formatINR(b.totalPrice)}</strong>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn btn-danger" onClick={() => setBookingToCancel(b)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
