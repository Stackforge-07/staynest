import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import BookingBox from '../components/BookingBox.jsx';
import Reviews from '../components/Reviews.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const load = () =>
    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        setListing(data);
        setActiveImageIndex(0);
      })
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!listing) return <Loader />;

  const images = listing.images || [];
  const showImage = (offset) => {
    setActiveImageIndex((current) => (current + offset + images.length) % images.length);
  };
  const handleGalleryKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(1);
    }
  };

  return (
    <section>
      <h1>{listing.title}</h1>
      <p className="muted">
        {listing.reviewCount > 0 ? `★ ${listing.avgRating} · ${listing.reviewCount} reviews · ` : ''}
        {listing.city}, {listing.state}
      </p>

      {images.length > 0 ? (
        <div className="listing-gallery" role="region" tabIndex={0} onKeyDown={handleGalleryKeyDown} aria-label="Stay photos">
          <div className="gallery-main">
            <img className="hero-img" src={images[activeImageIndex]} alt={`${listing.title} - photo ${activeImageIndex + 1}`} />
            {images.length > 1 && (
              <>
                <button className="gallery-arrow gallery-previous" aria-label="Previous photo" onClick={() => showImage(-1)}>‹</button>
                <button className="gallery-arrow gallery-next" aria-label="Next photo" onClick={() => showImage(1)}>›</button>
                <span className="gallery-count">{activeImageIndex + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbnails" aria-label="Choose a photo">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={`gallery-thumbnail${activeImageIndex === index ? ' active' : ''}`}
                  aria-label={`Show photo ${index + 1} of ${images.length}`}
                  aria-pressed={activeImageIndex === index}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : <p className="muted">No photos available.</p>}

      <div className="detail-layout">
        <div>
          <h2>
            {listing.type} hosted by {listing.host?.name}
          </h2>
          <p className="muted">
            Up to {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
          </p>
          <p>{listing.description}</p>

          <h3>Amenities</h3>
          <ul className="amenities">
            {listing.amenities.map((a) => <li key={a}>✓ {a}</li>)}
          </ul>

          <h3>Location</h3>
          <p className="muted">{listing.address}, {listing.city}</p>
          {/* TODO: show a map (Leaflet + OpenStreetMap) - see issue tracker */}

          <Reviews listingId={listing._id} onReviewAdded={load} />
        </div>
        <BookingBox listing={listing} />
      </div>
    </section>
  );
}
