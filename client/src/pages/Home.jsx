import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };
const PAGE_SIZE = 8;

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (params, page = 1, sortBy = sort) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: { ...clean, page, limit: PAGE_SIZE, sort: sortBy } })
      .then(({ data }) => {
        setListings(data.listings);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial, 1, sort);
  }, []);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    search(filters, 1, sort);
  };

  const changeSort = (event) => {
    const nextSort = event.target.value;
    setSort(nextSort);
    search(filters, 1, nextSort);
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="listing-controls">
        <label>
          Sort stays
          <select value={sort} onChange={changeSort}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>
        <span className="muted">{pagination.total} stays</span>
      </div>
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <div className="grid">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
      {!loading && !error && (
        <nav className="pagination" aria-label="Listing pages">
          <button className="btn btn-ghost" disabled={pagination.page <= 1} onClick={() => search(filters, pagination.page - 1)}>Previous</button>
          <span aria-live="polite">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => search(filters, pagination.page + 1)}>Next</button>
        </nav>
      )}
    </section>
  );
}
