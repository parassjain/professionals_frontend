import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getPopularServices } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';

export default function Categories() {
  const [supercategories, setSupercategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getPopularServices()])
      .then(([cats, popular]) => {
        setSupercategories(cats.data);
        setPopularServices(popular.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="page-title">Service Categories</h1>
        <p className="page-subtitle">Browse professionals by category to find the right expert</p>

        {popularServices.length > 0 && (
          <div className="mb-4 mt-4">
            <h2 className="section-title">Most Popular Services</h2>
            <div className="card-grid-4">
              {popularServices.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  <div className="category-card-icon">
                    <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={28} />
                  </div>
                  <h3>{cat.name}</h3>
                  <p className="text-muted">{cat.contact_count} contacts</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {supercategories.map((superCat) => (
          <div key={superCat.id} className="mb-4">
            <div className="mb-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  background: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <CategoryIcon icon={superCat.icon} slug={superCat.slug} name={superCat.name} size={24} />
                </div>
                <div>
                  <h2 className="section-title text-left" style={{ marginBottom: 0 }}>{superCat.name}</h2>
                  {superCat.description && <p className="text-muted mt-1">{superCat.description}</p>}
                </div>
              </div>
            </div>
            <div className="card-grid-4">
              {superCat.subcategories?.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
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
  );
}
