import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getCategories, getProfessionals, getSiteStats } from '../api/endpoints';
import { SITE_URL, SITE_NAME } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { Search, Shield, Star, Users, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import StarRating from '../components/StarRating';
import CategoryIcon from '../components/CategoryIcon';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [supercategories, setSupercategories] = useState([]);
  const [topPros, setTopPros] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCategories()
      .then((r) => setSupercategories(r.data.slice(0, 4)))
      .catch(() => {});
    getProfessionals({ ordering: '-avg_rating', page_size: 4 }).then((r) => setTopPros(r.data.results || r.data)).catch(() => {});
    getSiteStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: "India's marketplace for finding trusted local service professionals — maids, cooks, drivers, plumbers, electricians, brokers and more.",
    areaServed: { '@type': 'Country', name: 'India' },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/professionals?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const handleJoinProfessional = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/become-professional' } });
    } else if (user?.is_professional) {
      navigate('/profile');
    } else {
      navigate('/become-professional');
    }
  };

  return (
    <div>
      <Helmet>
        <title>{`${SITE_NAME} — Find Trusted Local Professionals in India`}</title>
        <meta name="description" content={`Hire verified maids, cooks, drivers, plumbers, electricians, brokers and 50+ other professionals near you. Read real reviews. Contact directly on ${SITE_NAME}.`} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content={`${SITE_NAME} — Find Trusted Local Professionals in India`} />
        <meta property="og:description" content={`Hire verified maids, cooks, drivers, plumbers, electricians, brokers and 50+ other professionals near you. Read real reviews. Contact directly.`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>
      <section className="hero">
        <div className="hero-content container">
          <h1>Find Trusted Professionals Near You</h1>
          <p>Connect with verified experts for any service — from plumbing and electrical to tutoring and design. Your next professional is just a click away.</p>
          <div className="hero-actions">
            <Link to="/professionals" className="btn btn-primary btn-lg">
              <Search size={20} /> Find a Professional
            </Link>
            <button type="button" onClick={handleJoinProfessional} className="btn btn-outline btn-lg">
              Join as a Professional
            </button>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <Users size={28} />
              <h3>{stats ? stats.total_users.toLocaleString() : '—'}</h3>
              <p>Registered Users</p>
            </div>
            <div className="stat-card">
              <Shield size={28} />
              <h3>{stats ? stats.total_professionals.toLocaleString() : '—'}</h3>
              <p>Active Professionals</p>
            </div>
            <div className="stat-card">
              <Star size={28} />
              <h3>{stats ? stats.total_reviews.toLocaleString() : '—'}</h3>
              <p>Reviews Posted</p>
            </div>
            <div className="stat-card">
              <Briefcase size={28} />
              <h3>{stats ? stats.total_jobs.toLocaleString() : '—'}</h3>
              <p>Jobs Posted</p>
            </div>
          </div>
        </div>
      </section>

      {supercategories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find the right professional for your specific needs</p>
            </div>
            <div className="card-grid-4">
              {supercategories.map((superCat) =>
                superCat.subcategories?.slice(0, 4).map((cat) => (
                  <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                    <div className="category-card-icon">
                      <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={28} />
                    </div>
                    <span className="category-super-name">{superCat.name}</span>
                    <h3>{cat.name}</h3>
                  </Link>
                ))
              )}
            </div>
            <div className="text-center mt-4">
              <Link to="/categories" className="btn btn-outline">
                View All Categories <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {topPros.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">Top Rated Professionals</h2>
              <p className="section-subtitle">Highly rated experts ready to help you</p>
            </div>
            <div className="card-grid">
              {topPros.map((pro) => (
                <Link to={`/professionals/${pro.public_id}`} key={pro.public_id} className="pro-card">
                  <div className="pro-card-header">
                    <div className="avatar">
                      {(pro.user?.avatar || pro.user?.avatar_url) ? <img src={pro.user.avatar || pro.user.avatar_url} alt={`${pro.user?.first_name} ${pro.user?.last_name} — ${pro.headline}`} loading="lazy" /> : <span>{pro.user?.first_name?.[0]}{pro.user?.last_name?.[0]}</span>}
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
                  <div className="pro-card-tags">
                    {pro.services?.slice(0, 3).map((s) => (
                      <span key={s.id} className="tag">{s.name}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/professionals" className="btn btn-primary">
                Browse All Professionals <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
