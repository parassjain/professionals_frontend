import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = { name: '', description: '', icon: null };

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState(null); // null = adding new
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCategories = () =>
    getCategories()
      .then((r) => setCategories(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingSlug(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description, icon: null });
    setEditingSlug(cat.slug);
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      if (form.icon) fd.append('icon', form.icon);

      if (editingSlug) {
        await updateCategory(editingSlug, fd);
      } else {
        await createCategory(fd);
      }
      closeForm();
      setLoading(true);
      await fetchCategories();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Something went wrong.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await deleteCategory(slug);
      setDeleteConfirm(null);
      setCategories((prev) => prev.filter((c) => c.slug !== slug));
    } catch {
      setError('Failed to delete category.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="section">
      <div className="container container-md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
            <p className="text-muted text-sm">Manage service categories</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Category
          </button>
        </div>

        {error && !showForm && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>
        )}

        {/* Add / Edit form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              {editingSlug ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maid"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the service"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => setForm({ ...form, icon: e.target.files[0] || null })}
                />
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Check size={16} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={thStyle}>Icon</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.slug} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={tdStyle}>
                    {cat.icon
                      ? <img src={cat.icon} alt="" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: 6 }} />
                      : <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ ...tdStyle, color: 'var(--gray-500)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{cat.slug}</td>
                  <td style={{ ...tdStyle, color: 'var(--gray-600)', fontSize: '0.875rem', maxWidth: 240 }}>
                    {cat.description ? cat.description.slice(0, 70) + (cat.description.length > 70 ? '…' : '') : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {deleteConfirm === cat.slug ? (
                      <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>Delete?</span>
                        <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white', border: 'none' }}
                          onClick={() => handleDelete(cat.slug)}>Yes</button>
                        <button className="btn btn-sm btn-outline" onClick={() => setDeleteConfirm(null)}>No</button>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(cat)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-sm" style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
                          onClick={() => setDeleteConfirm(cat.slug)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-400)' }}>
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--gray-600)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '0.75rem 1rem',
  verticalAlign: 'middle',
};
