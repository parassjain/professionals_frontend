import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getJobs, getSupercategories, getAllCategories } from '../api/endpoints';
import { SITE_URL, SITE_NAME } from '../config/site';
import { Search, MapPin, Filter, Briefcase, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
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
    Promise.all([getSupercategories(), getAllCategories()])
      .then(([supercats, subcats]) => {
        const superData = supercats.data.map(c => ({ ...c, is_sub: false }));
        const subData = subcats.data.map(c => ({ ...c, is_sub: true }));
        setCategories([...superData, ...subData]);
      })
      .catch(() => {});
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

  const cityLabel = filters.city ? ` in ${filters.city.charAt(0).toUpperCase() + filters.city.slice(1)}` : '';
  const catLabel = filters.category ? ` ${filters.category.replace(/-/g, ' ')}` : '';
  const jobsMetaTitle = `${catLabel || ' Local'} Jobs${cityLabel} | ${SITE_NAME}`;
  const jobsMetaDesc = `Browse open${catLabel} job postings${cityLabel} on ${SITE_NAME}. Post a job or find professionals for domestic and skilled work.`;

  return (
    <div className="section">
      <Helmet>
        <title>{jobsMetaTitle}</title>
        <meta name="description" content={jobsMetaDesc} />
        <link rel="canonical" href={`${SITE_URL}/jobs`} />
      </Helmet>
      <div className="container">
        <div className="page-header-row">
          <h1 className="page-title" style={{ textAlign: 'left', marginBottom: 0 }}>Job Board</h1>
          <Link to="/jobs/create" className="btn btn-primary">
            <Briefcase size={16} /> Post a Job
          </Link>
        </div>
        <p className="page-subtitle text-left" style={{ marginBottom: '2rem' }}>Browse and apply for available jobs</p>

        <form className="search-filters" onSubmit={applySearch}>
          <div className="search-bar">
            <Search size={20} />
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
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-gray'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="job-desc">{job.description?.slice(0, 180)}{job.description?.length > 180 ? '...' : ''}</p>
                  <div className="job-card-meta">
                    {job.category && <span className="tag">{job.category.name}</span>}
                    <span><MapPin size={14} /> {job.city}</span>
                    {job.budget_range && <span><DollarSign size={14} /> {job.budget_range}</span>}
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
