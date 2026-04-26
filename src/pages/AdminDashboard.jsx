import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check, ShieldCheck, ShieldOff, Users, Briefcase, Star, Shield } from 'lucide-react';
import {
  getAllCategories, getAllCategoriesAdmin, getSupercategories, createCategory, updateCategory, deleteCategory,
  adminListProfessionals, adminVerifyProfessional, getCategories,
  getSiteStats, adminCreateProfessional, deleteProfessionalProfile,
} from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── shared styles ────────────────────────────────────────────── */
const thStyle = {
  padding: '0.75rem 1rem', textAlign: 'left',
  fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const tdStyle = { padding: '0.75rem 1rem', verticalAlign: 'middle' };

/* ═══════════════════════════════════════════════════════════════
   CATEGORIES TAB
══════════════════════════════════════════════════════════════ */
const EMPTY_CAT = { name: '', description: '', icon: null, parent: '' };

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [supercategories, setSupercategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_CAT);
  const [editingSlug, setEditingSlug] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [allRes, superRes] = await Promise.all([getAllCategories(), getSupercategories()]);
      setCategories(allRes.data);
      setSupercategories(superRes.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setForm(EMPTY_CAT); setEditingSlug(null); setError(''); setShowForm(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description, icon: null, parent: cat.parent?.id || '' }); setEditingSlug(cat.slug); setError(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      if (form.parent && form.parent !== '') fd.append('parent', form.parent);
      if (form.icon) fd.append('icon', form.icon);
      if (editingSlug) { await updateCategory(editingSlug, fd); } else { await createCategory(fd); }
      closeForm(); setLoading(true); await fetchCategories();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (slug) => {
    try { await deleteCategory(slug); setDeleteConfirm(null); setCategories((p) => p.filter((c) => c.slug !== slug)); }
    catch { setError('Failed to delete category.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      {error && !showForm && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editingSlug ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cook" />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Category</label>
              <select className="form-input" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                <option value="">None (top-level category)</option>
                {supercategories.map((superCat) => (
                  <option key={superCat.id} value={superCat.id}>{superCat.name}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Leave empty to create a main category, or select one to create a subcategory.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (optional)</label>
              <input type="file" accept="image/*" className="form-input" onChange={(e) => setForm({ ...form, icon: e.target.files[0] || null })} />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}><X size={16} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={thStyle}>Icon</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Parent</th>
              <th style={thStyle}>Slug</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Pros</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.slug} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={tdStyle}>
                  {cat.icon ? <img src={cat.icon} alt="" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: 6 }} />
                    : <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>—</span>}
                </td>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{cat.name}</td>
                <td style={{ ...tdStyle, color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                  {cat.parent ? cat.parent.name : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                </td>
                <td style={{ ...tdStyle, color: 'var(--gray-500)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{cat.slug}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 28,
                    height: 24,
                    padding: '0 6px',
                    background: cat.professional_count > 0 ? 'var(--primary-light)' : 'var(--gray-100)',
                    color: cat.professional_count > 0 ? 'var(--primary)' : 'var(--gray-500)',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {cat.professional_count || 0}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {deleteConfirm === cat.slug ? (
                    <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>Delete?</span>
                      <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white', border: 'none' }} onClick={() => handleDelete(cat.slug)}>Yes</button>
                      <button className="btn btn-sm btn-outline" onClick={() => setDeleteConfirm(null)}>No</button>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(cat)} title="Edit"><Pencil size={14} /></button>
                      <button className="btn btn-sm" style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }} onClick={() => setDeleteConfirm(cat.slug)} title="Delete"><Trash2 size={14} /></button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-400)' }}>No categories yet. Add your first category above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFESSIONALS TAB
═══════════════════════════════════════════════════════════════ */
const EMPTY_PRO = {
  email: '', first_name: '', last_name: '', phone: '', city: '',
  headline: '', bio: '', years_experience: 0, address: '',
  services: [], is_verified: false,
};

function ProfessionalsTab() {
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PRO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAll = async () => {
    const [proRes, catRes] = await Promise.all([adminListProfessionals(), getCategories()]);
    setProfessionals(proRes?.data || []);
    setCategories(catRes?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleService = (id) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(id) ? prev.services.filter((s) => s !== id) : [...prev.services, id],
    }));
  };

  const openAdd = () => { setForm(EMPTY_PRO); setError(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.first_name.trim()) { setError('First name is required.'); return; }
    if (!form.headline.trim()) { setError('Headline is required.'); return; }
    setSaving(true); setError('');
    try {
      await adminCreateProfessional({
        ...form,
        years_experience: Number(form.years_experience),
      });
      closeForm();
      setLoading(true);
      await fetchAll();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteProfessionalProfile(id); setDeleteConfirm(null); setProfessionals((p) => p.filter((pro) => pro.public_id !== id)); }
    catch { setError('Failed to delete professional.'); }
  };

  const handleToggleVerify = async (pro) => {
    try {
      await adminVerifyProfessional(pro.public_id, !pro.is_verified);
      setProfessionals((prev) => prev.map((p) => p.public_id === pro.public_id ? { ...p, is_verified: !p.is_verified } : p));
    } catch { setError('Failed to update verification.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Professional</button>
      </div>

      {error && !showForm && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Add Professional Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>New Professional</h2>
          <form onSubmit={handleSubmit}>

            {/* Section: Account details */}
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Account Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="maid@example.com" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">First Name *</label>
                <input className="form-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Priya" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Sharma" />
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
              </div>
            </div>

            {/* Section: Profile details */}
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1rem 0 0.75rem' }}>Profile Details</p>
            <div className="form-group">
              <label className="form-label">Headline *</label>
              <input className="form-input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Experienced home maid with 5+ years" />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Brief description of skills and experience…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Years Experience</label>
                <input className="form-input" type="number" min={0} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city" />
              </div>
            </div>

            {/* Services */}
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Services / Categories</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
                {categories.map((cat) => (
                  <label key={cat.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.75rem', borderRadius: 20, cursor: 'pointer',
                    fontSize: '0.85rem', userSelect: 'none',
                    background: form.services.includes(cat.id) ? 'var(--primary-light)' : 'var(--gray-100)',
                    color: form.services.includes(cat.id) ? 'var(--primary-dark)' : 'var(--gray-700)',
                    border: form.services.includes(cat.id) ? '1px solid var(--primary)' : '1px solid transparent',
                  }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={form.services.includes(cat.id)} onChange={() => toggleService(cat.id)} />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Verified */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 1rem' }}>
              <input type="checkbox" id="is_verified" checked={form.is_verified} onChange={(e) => setForm({ ...form, is_verified: e.target.checked })} />
              <label htmlFor="is_verified" style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>Mark as Verified</label>
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}><Check size={16} /> {saving ? 'Saving…' : 'Create Professional'}</button>
              <button type="button" className="btn btn-outline" onClick={closeForm} disabled={saving}><X size={16} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Professionals table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Headline</th>
              <th style={thStyle}>Services</th>
              <th style={thStyle}>Verified</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((pro) => (
              <tr key={pro.public_id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>
                  {pro.user.first_name} {pro.user.last_name}
                </td>
                <td style={{ ...tdStyle, fontSize: '0.85rem', color: 'var(--gray-600)' }}>{pro.user.email ?? '—'}</td>
                <td style={{ ...tdStyle, fontSize: '0.875rem', maxWidth: 200 }}>
                  {pro.headline.slice(0, 50)}{pro.headline.length > 50 ? '…' : ''}
                </td>
                <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {pro.services.map((s) => (
                      <span key={s.id} style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '0.15rem 0.5rem', borderRadius: 12, fontSize: '0.75rem' }}>{s.name}</span>
                    ))}
                    {pro.services.length === 0 && <span style={{ color: 'var(--gray-400)' }}>—</span>}
                  </div>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleToggleVerify(pro)}
                    title={pro.is_verified ? 'Click to unverify' : 'Click to verify'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: pro.is_verified ? 'var(--green)' : 'var(--gray-400)' }}
                  >
                    {pro.is_verified ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
                    {pro.is_verified ? 'Verified' : 'Unverified'}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {deleteConfirm === pro.public_id ? (
                    <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>Delete?</span>
                      <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white', border: 'none' }} onClick={() => handleDelete(pro.public_id)}>Yes</button>
                      <button className="btn btn-sm btn-outline" onClick={() => setDeleteConfirm(null)}>No</button>
                    </span>
                  ) : (
                    <button className="btn btn-sm" style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }} onClick={() => setDeleteConfirm(pro.public_id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {professionals.length === 0 && (
              <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--gray-400)' }}>No professionals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS ROW
═══════════════════════════════════════════════════════════════ */
function StatTile({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray-200)',
      borderRadius: 10, padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.875rem',
    }}>
      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.1 }}>
          {value !== null ? Number(value).toLocaleString() : '—'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>{label}</div>
      </div>
    </div>
  );
}

function StatsRow() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    getSiteStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
      <StatTile icon={<Users size={22} />} label="Registered Users" value={stats?.total_users ?? null} />
      <StatTile icon={<Shield size={22} />} label="Active Professionals" value={stats?.total_professionals ?? null} />
      <StatTile icon={<Star size={22} />} label="Reviews Posted" value={stats?.total_reviews ?? null} />
      <StatTile icon={<Briefcase size={22} />} label="Jobs Posted" value={stats?.total_jobs ?? null} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD (tabs)
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [tab, setTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'professionals', label: 'Professionals' },
  ];

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p className="text-muted text-sm">Manage categories and professionals</p>
        </div>

        <StatsRow />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid var(--gray-200)', marginBottom: '1.5rem' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                border: 'none', background: 'none',
                borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t.id ? 'var(--primary)' : 'var(--gray-500)',
                marginBottom: '-2px',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'categories' && <CategoriesTab />}
        {tab === 'professionals' && <ProfessionalsTab />}
      </div>
    </div>
  );
}
