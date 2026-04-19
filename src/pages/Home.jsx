import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCategories, getProfessionals, getSiteStats } from '../api/endpoints';
import { Search, Shield, Star, Users, Briefcase } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [topPros, setTopPros] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.slice(0, 6))).catch(() => {});
    getProfessionals({ ordering: '-avg_rating', page_size: 4 }).then((r) => setTopPros(r.data.results || r.data)).catch(() => {});
    getSiteStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Find Trusted Professionals Near You</h1>
          <p>Connect with verified experts for any service — from plumbing and electrical to tutoring and design.</p>
          <div className="hero-actions">
            <Link to="/professionals" className="btn btn-primary btn-lg">
              <Search size={20} /> Find a Professional
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Join as a Professional
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section stats-section">
        <div className="container stats-grid">
          <div className="stat-card">
            <Users size={32} />
            <h3>{stats ? stats.total_users.toLocaleString() : '—'}</h3>
            <p>Registered Users</p>
          </div>
          <div className="stat-card">
            <Shield size={32} />
            <h3>{stats ? stats.total_professionals.toLocaleString() : '—'}</h3>
            <p>Active Professionals</p>
          </div>
          <div className="stat-card">
            <Star size={32} />
            <h3>{stats ? stats.total_reviews.toLocaleString() : '—'}</h3>
            <p>Reviews Posted</p>
          </div>
          <div className="stat-card">
            <Briefcase size={32} />
            <h3>{stats ? stats.total_jobs.toLocaleString() : '—'}</h3>
            <p>Jobs Posted</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Popular Categories</h2>
            <div className="card-grid">
              {categories.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  {cat.icon && <img src={cat.icon} alt={cat.name} className="category-icon" />}
                  <h3>{cat.name}</h3>
                  {cat.description && <p>{cat.description}</p>}
                </Link>
              ))}
            </div>
            <div className="text-center mt-2">
              <Link to="/categories" className="btn btn-outline">View All Categories</Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Professionals */}
      {topPros.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Top Rated Professionals</h2>
            <div className="card-grid">
              {topPros.map((pro) => (
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
                    {pro.avg_rating && <StarRating rating={pro.avg_rating} />}
                    <span className="text-muted">{pro.review_count || 0} reviews</span>
                    {pro.is_verified && <span className="badge badge-green">Verified</span>}
                  </div>
                  <div className="pro-card-tags">
                    {pro.services?.slice(0, 3).map((s) => (
                      <span key={s.id} className="tag">{s.name}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-2">
              <Link to="/professionals" className="btn btn-primary">Browse All Professionals</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
