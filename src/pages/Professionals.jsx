import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProfessionals, getCategories } from '../api/endpoints';
import { Search, MapPin, Filter, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Professionals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    is_verified: searchParams.get('is_verified') || '',
    ordering: searchParams.get('ordering') || '',
  });
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.is_verified) params.is_verified = filters.is_verified;
    if (filters.ordering) params.ordering = filters.ordering;

    getProfessionals(params)
      .then((r) => {
        const data = r.data;
        setProfessionals(data.results || data);
        setTotalPages(data.count ? Math.ceil(data.count / 20) : 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, filters]);

  const applySearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    setSearchParams(params);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="page-title">Find Professionals</h1>
        <p className="page-subtitle">Browse through our network of verified experts</p>

        <form className="search-filters" onSubmit={applySearch}>
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, headline, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <Filter size={16} />
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <MapPin size={16} />
              <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
            </div>
            <div className="filter-group">
              <select value={filters.is_verified} onChange={(e) => setFilters({ ...filters, is_verified: e.target.value })}>
                <option value="">All</option>
                <option value="true">Verified Only</option>
              </select>
            </div>
            <div className="filter-group">
              <select value={filters.ordering} onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}>
                <option value="">Sort by</option>
                <option value="-avg_rating">Highest Rated</option>
                <option value="-created_at">Newest</option>
                <option value="created_at">Oldest</option>
              </select>
            </div>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : professionals.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <p>No professionals found matching your criteria.</p>
            <Link to="/professionals" className="btn btn-outline">Clear Filters</Link>
          </div>
        ) : (
          <>
            <div className="card-grid">
              {professionals.map((pro) => (
                <Link to={`/professionals/${pro.public_id}`} key={pro.public_id} className="pro-card">
                  <div className="pro-card-header">
                    <div className="avatar">
                      {(pro.user?.avatar || pro.user?.avatar_url) ? <img src={pro.user.avatar || pro.user.avatar_url} alt="" /> : <span>{pro.user?.first_name?.[0]}{pro.user?.last_name?.[0]}</span>}
                    </div>
                    <div>
                      <h3>{pro.user?.first_name} {pro.user?.last_name}</h3>
                      <p className="text-muted">{pro.headline}</p>
                    </div>
                  </div>
                  <div className="pro-card-meta">
                    {pro.avg_rating ? <StarRating rating={pro.avg_rating} /> : <span className="text-muted">No ratings</span>}
                    <span className="text-muted">({pro.review_count || 0})</span>
                    {pro.is_verified && <span className="badge badge-success"><Sparkles size={12} /> Verified</span>}
                  </div>
                  {pro.years_experience > 0 && <p className="text-sm text-muted">{pro.years_experience} years experience</p>}
                  <div className="pro-card-tags">
                    {pro.services?.slice(0, 3).map((s) => <span key={s.id} className="tag">{s.name}</span>)}
                    {pro.services?.length > 3 && <span className="tag tag-more">+{pro.services.length - 3}</span>}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-sm btn-outline">
                  <ChevronLeft size={16} /> Prev
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-sm btn-outline">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
