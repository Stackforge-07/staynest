import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

function validateForm(form) {
  const errors = {};
  const titleLength = form.title.trim().length;
  if (titleLength < 10 || titleLength > 100) errors.title = 'Title must be between 10 and 100 characters.';
  if (form.description.trim().length < 30) errors.description = 'Description must be at least 30 characters.';
  if (!form.pricePerNight || !Number.isFinite(Number(form.pricePerNight)) || Number(form.pricePerNight) <= 0) {
    errors.pricePerNight = 'Price must be greater than ₹0.';
  }
  if (form.imageUrl.trim()) {
    try {
      const imageUrl = new URL(form.imageUrl.trim());
      if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Unsupported image URL protocol');
    } catch {
      errors.imageUrl = 'Enter a valid image URL beginning with http:// or https://.';
    }
  }
  return errors;
}

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const validationErrors = validateForm(form);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
      imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <input required placeholder="Title" value={form.title} onChange={set('title')} aria-invalid={Boolean(validationErrors.title)} aria-describedby={validationErrors.title ? 'title-error' : undefined} />
      {validationErrors.title && <p className="error" id="title-error">{validationErrors.title}</p>}
      <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} aria-invalid={Boolean(validationErrors.description)} aria-describedby={validationErrors.description ? 'description-error' : undefined} />
      {validationErrors.description && <p className="error" id="description-error">{validationErrors.description}</p>}
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required type="number" min="0" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} aria-invalid={Boolean(validationErrors.pricePerNight)} aria-describedby={validationErrors.pricePerNight ? 'price-error' : undefined} />
      </div>
      {validationErrors.pricePerNight && <p className="error" id="price-error">{validationErrors.pricePerNight}</p>}
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      <input placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} aria-invalid={Boolean(validationErrors.imageUrl)} aria-describedby={validationErrors.imageUrl ? 'image-error' : undefined} />
      {validationErrors.imageUrl && <p className="error" id="image-error">{validationErrors.imageUrl}</p>}
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={Object.keys(validationErrors).length > 0}>{isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
