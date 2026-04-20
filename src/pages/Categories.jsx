import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';

const CITIES = [
  { slug: 'bangalore', name: 'Bangalore', short: 'BLR' },
  { slug: 'mumbai', name: 'Mumbai', short: 'MUM' },
  { slug: 'delhi', name: 'Delhi NCR', short: 'DEL' },
  { slug: 'hyderabad', name: 'Hyderabad', short: 'HYD' },
  { slug: 'chennai', name: 'Chennai', short: 'CHN' },
  { slug: 'pune', name: 'Pune', short: 'PUN' },
  { slug: 'kolkata', name: 'Kolkata', short: 'CCU' },
  { slug: 'gurgaon', name: 'Gurgaon', short: 'GGH' },
  { slug: 'noida', name: 'Noida', short: 'NOIDA' },
  { slug: 'ahmedabad', name: 'Ahmedabad', short: 'AMD' },
];

const POPULAR_CATEGORIES = [
  'home-cleaning', 'plumbing', 'electrical', 'ac-repair', 'pest-control',
  'beautician', 'photography', 'personal-trainer', 'tuition', 'digital-marketing'
];

export default function Categories() {
  const [supercategories, setSupercategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('bangalore');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    getCategories()
      .then((r) => setSupercategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredSubcategories = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return supercategories
      .flatMap(sc => (sc.subcategories || []).map(cat => ({ ...cat, superCategory: sc.name })))
      .filter(cat => 
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query)) ||
        cat.superCategory.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [supercategories, search]);

  const popularCategories = useMemo(() => {
    return supercategories
      .flatMap(sc => sc.subcategories || [])
      .filter(cat => POPULAR_CATEGORIES.includes(cat.slug))
      .slice(0, 6);
  }, [supercategories]);

  const currentCity = CITIES.find(c => c.slug === selectedCity) || CITIES[0];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="container">
          <h1 className="categories-title">Find Trusted Professionals</h1>
          <p className="categories-subtitle">Verified experts in your city, ready to help</p>

          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search for services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="city-selector" ref={cityRef}>
              <button className="city-selector-btn" onClick={() => setShowCityDropdown(!showCityDropdown)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{currentCity.name}</span>
                <svg className={`chevron ${showCityDropdown ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showCityDropdown && (
                <div className="city-dropdown">
                  {CITIES.map(city => (
                    <button
                      key={city.slug}
                      className={`city-option ${city.slug === selectedCity ? 'active' : ''}`}
                      onClick={() => { setSelectedCity(city.slug); setShowCityDropdown(false); }}
                    >
                      <span className="city-short">{city.short}</span>
                      <span>{city.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {search && filteredSubcategories.length > 0 && (
            <div className="search-results">
              {filteredSubcategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/professionals?category=${cat.slug}&city=${selectedCity}`}
                  className="search-result-item"
                  onClick={() => setSearch('')}
                >
                  <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={20} />
                  <div>
                    <span className="search-result-name">{cat.name}</span>
                    <span className="search-result-category">{cat.superCategory}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="container">
          {popularCategories.length > 0 && (
            <div className="categories-section mb-4">
              <div className="section-header">
                <div>
                  <h2 className="section-title text-left">Popular Services</h2>
                  <p className="section-subtitle text-left">Most booked this month</p>
                </div>
              </div>
              <div className="popular-grid">
                {popularCategories.map(cat => (
                  <Link key={cat.id} to={`/professionals?category=${cat.slug}&city=${selectedCity}`} className="popular-card">
                    <div className="popular-icon">
                      <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={28} />
                    </div>
                    <h3>{cat.name}</h3>
                    <span className="popular-link">View {cat.name}s →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {supercategories.map((superCat) => (
            <div key={superCat.id} className="categories-section mb-4">
              <div className="section-header">
                <div className="section-header-badge">
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <CategoryIcon icon={superCat.icon} slug={superCat.slug} name={superCat.name} size={22} />
                  </div>
                  <div>
                    <h2 className="section-title text-left" style={{ marginBottom: 0 }}>{superCat.name}</h2>
                    {superCat.description && <p className="text-muted mt-1">{superCat.description}</p>}
                  </div>
                </div>
              </div>
              <div className="card-grid-4">
                {superCat.subcategories?.map((cat) => (
                  <Link key={cat.id} to={`/professionals?category=${cat.slug}&city=${selectedCity}`} className="category-card">
                    <div className="category-card-icon">
                      <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={28} />
                    </div>
                    <h3>{cat.name}</h3>
                    {cat.description && <p>{cat.description}</p>}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {supercategories.length === 0 && (
            <div className="empty-state">
              <p>No categories available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
