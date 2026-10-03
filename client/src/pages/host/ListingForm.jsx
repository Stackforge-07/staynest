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
  imageUrls: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrls: (data.images || []).join('\n'),
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
    const images = form.imageUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    if (images.length) payload.images = images;
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
      <input required placeholder="Title" value={form.title} onChange={set('title')} />
      <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} />
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required type="number" min="0" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} />
      </div>
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
      <label>
        Image URLs (one per line, optional)
        <textarea placeholder="https://example.com/stay.jpg" value={form.imageUrls} onChange={set('imageUrls')} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn">{isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
