import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob, updateJob, getJob, getCategories } from '../api/endpoints';

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', title: '', description: '', city: '', budget_range: '', status: 'open' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      getJob(id).then((r) => {
        const j = r.data;
        setForm({
          category: j.category?.id || '',
          title: j.title,
          description: j.description,
          city: j.city,
          budget_range: j.budget_range || '',
          status: j.status,
        });
      }).catch(() => navigate('/jobs'));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateJob(id, form);
      } else {
        await createJob(form);
      }
      navigate('/jobs');
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
              <label>City *</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required placeholder="City" />
            </div>
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
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
