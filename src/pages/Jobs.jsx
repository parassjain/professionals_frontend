import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs, getCategories } from '../api/endpoints';
import { Search, MapPin, Filter, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    status: searchParams.get('status') || 'open',
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
    if (filters.status) params.status = filters.status;

    getJobs(params)
      .then((r) => {
        const data = r.data;
        setJobs(data.results || data);
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
        <div className="page-header-row">
          <h1 className="page-title">Job Board</h1>
          <Link to="/jobs/create" className="btn btn-primary">
            <Briefcase size={16} /> Post a Job
          </Link>
        </div>

        <form className="search-filters" onSubmit={applySearch}>
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <Filter size={14} />
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <MapPin size={14} />
              <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
            </div>
            <div className="filter-group">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} />
            <p>No jobs found.</p>
          </div>
        ) : (
          <>
            <div className="jobs-list">
              {jobs.map((job) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-muted job-desc">{job.description?.slice(0, 150)}{job.description?.length > 150 ? '...' : ''}</p>
                  <div className="job-card-meta">
                    {job.category && <span className="tag">{job.category.name}</span>}
                    <span><MapPin size={14} /> {job.city}</span>
                    {job.budget_range && <span>Budget: {job.budget_range}</span>}
                    <span className="text-muted">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="job-card-poster">
                    Posted by {job.posted_by?.first_name} {job.posted_by?.last_name}
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
