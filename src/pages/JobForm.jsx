import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, updateJob, getJob, getCategories } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';

const LocationPicker = lazy(() => import('../components/LocationPicker'));

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: '', title: '', description: '', city: '', budget_range: '', status: 'open',
    latitude: null, longitude: null, city_detected: false,
  });
  const [flyTo, setFlyTo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      getJob(id).then((r) => {
        const j = r.data;
        const lat = j.latitude ? parseFloat(j.latitude) : null;
        const lng = j.longitude ? parseFloat(j.longitude) : null;
        setForm({
          category: j.category?.id || '',
          title: j.title,
          description: j.description,
          city: j.city,
          budget_range: j.budget_range || '',
          status: j.status,
          latitude: lat,
          longitude: lng,
        });
        if (lat && lng) setFlyTo({ lat, lng });
      }).catch(() => navigate('/jobs'));
    }
  }, [id, isEdit, navigate]);

  const handleLocationChange = ({ lat, lng, city }) => {
    setForm((f) => ({ ...f, latitude: lat, longitude: lng, city: city || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.latitude === null || form.longitude === null) {
      setError('Please select a location on the map');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await updateJob(id, payload);
      } else {
        await createJob(payload);
      }
      navigate('/profile');
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'string' ? data : data?.detail || JSON.stringify(data) || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container container-sm">
        <h1 className="page-title">{isEdit ? 'Edit Job' : 'Post a Job'}</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Need a plumber for kitchen renovation" maxLength={200} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Describe the work needed..." rows={5} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget Range</label>
              <input type="text" value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} placeholder="e.g. $100-$500" />
            </div>
          </div>
          {isEdit && (
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Job Location <span className="text-muted">(click to pin on map)</span></label>
            <Suspense fallback={<div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>}>
              <LocationPicker
                value={form.latitude !== null ? { lat: form.latitude, lng: form.longitude } : null}
                onChange={handleLocationChange}
                flyTo={flyTo}
              />
            </Suspense>
            {form.latitude === null && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.25rem)' }}>Please select a location</p>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
