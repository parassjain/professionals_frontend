import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfessionalProfile, getCategories } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function BecomeProfessional() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ headline: '', bio: '', years_experience: 0, address: '', services: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.is_professional) navigate('/profile');
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createProfessionalProfile(form);
      await fetchUser();
      navigate('/profile');
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'string' ? data : data?.detail || data?.non_field_errors?.[0] || JSON.stringify(data) || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter((s) => s !== id) : [...f.services, id],
    }));
  };

  return (
    <div className="section">
      <div className="container container-sm">
        <h1 className="page-title">Become a Professional</h1>
        <p className="text-muted text-center mb-2">Create your professional profile and start getting clients</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Headline *</label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              required
              placeholder="e.g. Expert Plumber with 10+ years experience"
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell clients about yourself, your skills, and experience..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              min={0}
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Your service area or address"
            />
          </div>
          <div className="form-group">
            <label>Services (select categories)</label>
            <div className="checkbox-grid">
              {categories.map((cat) => (
                <label key={cat.id} className={`checkbox-tag ${form.services.includes(cat.id) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.services.includes(cat.id)}
                    onChange={() => toggleService(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Create Professional Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
