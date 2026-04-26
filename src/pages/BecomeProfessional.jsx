import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfessionalProfile, addPortfolioImage } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import { getCategories } from '../api/endpoints';

export default function BecomeProfessional() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ headline: '', bio: '', years_experience: 0, address: '', alternate_phone: '', services: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // portfolio step
  const [step, setStep] = useState('form'); // 'form' | 'portfolio'
  const [createdProId, setCreatedProId] = useState(null);
  const [portfolioImages, setPortfolioImages] = useState([]); // { preview, file, uploaded }
  const [portfolioUploading, setPortfolioUploading] = useState(false);

  useEffect(() => {
    if (user?.is_professional) navigate('/profile');
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createProfessionalProfile(form);
      setCreatedProId(res.data.public_id);
      await fetchUser();
      setStep('portfolio');
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

  const handlePortfolioSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - portfolioImages.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));
    setPortfolioImages((prev) => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const handlePortfolioRemoveLocal = (index) => {
    setPortfolioImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePortfolioFinish = async () => {
    if (!createdProId) { navigate('/profile'); return; }
    setPortfolioUploading(true);
    try {
      for (const item of portfolioImages) {
        const fd = new FormData();
        fd.append('image', item.file);
        await addPortfolioImage(createdProId, fd);
      }
    } catch { /* ignore — user can add more from profile */ } finally {
      setPortfolioUploading(false);
      navigate('/profile');
    }
  };

  if (step === 'portfolio') {
    return (
      <div className="section">
        <div className="container container-sm">
          <h1 className="page-title">Add Portfolio Photos</h1>
          <p className="text-muted text-center mb-2">
            Showcase your work — add up to 10 photos. You can also skip and add them later from your profile.
          </p>

          {portfolioImages.length > 0 && (
            <div className="portfolio-grid" style={{ marginBottom: '1.5rem' }}>
              {portfolioImages.map((img, i) => (
                <div key={i} className="portfolio-item">
                  <img src={img.preview} alt="Preview" className="portfolio-img" />
                  <button
                    className="portfolio-delete-btn"
                    onClick={() => handlePortfolioRemoveLocal(i)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {portfolioImages.length < 10 && (
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                Add Photos
                <input type="file" accept="image/*" multiple hidden onChange={handlePortfolioSelect} />
              </label>
            )}
            <button
              className="btn btn-primary"
              onClick={handlePortfolioFinish}
              disabled={portfolioUploading}
            >
              {portfolioUploading ? 'Uploading...' : portfolioImages.length > 0 ? 'Upload & Continue' : 'Skip for Now'}
            </button>
          </div>
          <p className="text-muted text-sm">You can manage portfolio photos anytime from your profile page.</p>
        </div>
      </div>
    );
  }

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
            <label>Alternate Phone (optional)</label>
            <input
              type="tel"
              value={form.alternate_phone}
              onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })}
              placeholder="+91 98765 43210"
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
