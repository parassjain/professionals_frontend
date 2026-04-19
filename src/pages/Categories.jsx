import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="page-title">Service Categories</h1>
        <p className="text-muted text-center mb-2">Browse professionals by category</p>
        <div className="card-grid">
          {categories.map((cat) => (
            <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
              <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} className="category-icon" />
              <h3>{cat.name}</h3>
              {cat.description && <p>{cat.description}</p>}
            </Link>
          ))}
        </div>
        {categories.length === 0 && <p className="text-center text-muted">No categories available yet.</p>}
      </div>
    </div>
  );
}
