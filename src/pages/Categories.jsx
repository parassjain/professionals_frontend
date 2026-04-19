import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryTree, getCategories } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryIcon from '../components/CategoryIcon';

export default function Categories() {
  const [supercategories, setSupercategories] = useState([]);
  const [uncategorized, setUncategorized] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategoryTree(), getCategories()])
      .then(([treeRes, allRes]) => {
        setSupercategories(treeRes.data);
        const all = allRes.data;
        const orphaned = all.filter((c) => c.parent === null && !treeRes.data.some((s) => s.id === c.id));
        setUncategorized(orphaned);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="section">
      <div className="container">
        <h1 className="page-title">Service Categories</h1>
        <p className="text-muted text-center mb-2">Browse professionals by category</p>

        {supercategories.map((superCat) => (
          <div key={superCat.id} className="category-section">
            <h2 className="section-title">{superCat.name}</h2>
            {superCat.description && <p className="text-muted mb-2">{superCat.description}</p>}
            <div className="card-grid">
              {superCat.subcategories?.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} className="category-icon" />
                  <h3>{cat.name}</h3>
                  {cat.description && <p>{cat.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="category-section">
            <h2 className="section-title">Other Services</h2>
            <div className="card-grid">
              {uncategorized.map((cat) => (
                <Link to={`/professionals?category=${cat.slug}`} key={cat.id} className="category-card">
                  <CategoryIcon icon={cat.icon} slug={cat.slug} name={cat.name} className="category-icon" />
                  <h3>{cat.name}</h3>
                  {cat.description && <p>{cat.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {supercategories.length === 0 && uncategorized.length === 0 && (
          <p className="text-center text-muted">No categories available yet.</p>
        )}
      </div>
    </div>
  );
}