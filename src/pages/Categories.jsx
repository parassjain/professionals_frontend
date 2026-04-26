import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCategories, getPopularServices } from '../api/endpoints';
import { SITE_URL, SITE_NAME } from '../config/site';
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

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Professional Service Categories on ${SITE_NAME}`,
    url: `${SITE_URL}/categories`,
    itemListElement: supercategories.map((cat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cat.name,
      url: `${SITE_URL}/professionals?category=${cat.slug}`,
    })),
  };

  return (
    <div className="section">
      <Helmet>
        <title>{`Professional Services Categories | ${SITE_NAME}`}</title>
        <meta name="description" content={`Browse all service categories: maids, cooks, drivers, plumbers, electricians, brokers, tutors, carpenters and 50+ more. Find the right professional for your needs on ${SITE_NAME}.`} />
        <link rel="canonical" href={`${SITE_URL}/categories`} />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>
      <div className="container">
        <h1 className="page-title">Service Categories</h1>
        <p className="page-subtitle">Browse professionals by category to find the right expert</p>

        {popularServices.length > 0 && (
          <div className="mb-4 mt-4 text-center">
            <h2 className="section-title">Most Popular Services</h2>
            <div className="card-grid-8">
              {popularServices.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  <div className="category-card-icon">
                    <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={22} />
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
            <div className="mb-3 text-center">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 10, 
                  background: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <CategoryIcon icon={superCat.icon} slug={superCat.slug} name={superCat.name} size={20} />
                </div>
                <div>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>{superCat.name}</h2>
                  {superCat.description && <p className="text-muted mt-1">{superCat.description}</p>}
                </div>
              </div>
            </div>
            <div className="card-grid-8">
              {superCat.subcategories?.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  <div className="category-card-icon">
                    <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} size={22} />
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
