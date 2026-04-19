import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUser, updateCurrentUserWithFile, updateProfessionalProfile, getProfessional, getProfessionals, getJobs, getReviews, addPortfolioImage, deletePortfolioImage, addSocialLink, deleteSocialLink } from '../api/endpoints';
import { User, Mail, Phone, MapPin, Edit, Briefcase, Star, CheckCircle, XCircle, Trash2, ImagePlus, Link2, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, fetchUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [proProfile, setProProfile] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' });
  const [socialError, setSocialError] = useState('');

  const PLATFORMS = ['facebook', 'linkedin', 'twitter', 'github', 'instagram', 'youtube', 'website'];
  const PLATFORM_LABELS = { facebook: 'Facebook', linkedin: 'LinkedIn', twitter: 'Twitter / X', github: 'GitHub', instagram: 'Instagram', youtube: 'YouTube', website: 'Website' };
  const platformIcon = (p) => {
    if (p === 'github') return <Github size={16} />;
    if (p === 'linkedin') return <Linkedin size={16} />;
    if (p === 'twitter') return <Twitter size={16} />;
    return <Globe size={16} />;
  };
  const availablePlatforms = PLATFORMS.filter((p) => !socialLinks.some((l) => l.platform === p));

  useEffect(() => {
    if (!user) return;
    setForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '', city: user.city || '' });
    setSocialLinks(user.social_links || []);

    const fetches = [
      getJobs({ posted_by: user.public_id }).catch(() => ({ data: { results: [] } })),
      getReviews({ reviewer: user.public_id }).catch(() => ({ data: { results: [] } })),
      getReviews({ reviewed_user: user.public_id }).catch(() => ({ data: { results: [] } })),
    ];

    if (user.is_professional) {
      fetches.push(
        getProfessionals({ search: user.first_name }).catch(() => ({ data: { results: [] } }))
      );
    }

    Promise.all(fetches)
      .then(([jobsRes, reviewsRes, receivedRes, prosRes]) => {
        setMyJobs(jobsRes.data.results || jobsRes.data || []);
        setMyReviews(reviewsRes.data.results || reviewsRes.data || []);
        setReceivedReviews(receivedRes.data.results || receivedRes.data || []);
        if (prosRes) {
          const pros = prosRes.data.results || prosRes.data || [];
          const myPro = pros.find((p) => p.user?.public_id === user.public_id);
          if (myPro) {
            setProProfile(myPro);
            return getProfessional(myPro.public_id);
          }
        }
        return null;
      })
      .then((detailRes) => {
        if (detailRes) setPortfolioImages(detailRes.data.portfolio_images || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    setSocialError('');
    if (!socialForm.platform || !socialForm.url) return;
    try {
      const res = await addSocialLink(socialForm);
      setSocialLinks((prev) => {
        const filtered = prev.filter((l) => l.platform !== res.data.platform);
        return [...filtered, res.data];
      });
      setSocialForm({ platform: '', url: '' });
    } catch (err) {
      setSocialError(err.response?.data?.url?.[0] || 'Failed to save link.');
    }
  };

  const handleDeleteSocialLink = async (id) => {
    try {
      await deleteSocialLink(id);
      setSocialLinks((prev) => prev.filter((l) => l.id !== id));
    } catch { /* ignore */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateCurrentUser(form);
      await fetchUser();
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      await updateCurrentUserWithFile(fd);
      await fetchUser();
    } catch { /* ignore */ }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !proProfile) return;
    const remaining = 10 - portfolioImages.length;
    const toUpload = files.slice(0, remaining);
    setPortfolioUploading(true);
    try {
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await addPortfolioImage(proProfile.public_id, fd);
        setPortfolioImages((prev) => [...prev, res.data]);
      }
    } catch { /* ignore */ } finally {
      setPortfolioUploading(false);
      e.target.value = '';
    }
  };

  const handlePortfolioDelete = async (imgId) => {
    if (!proProfile) return;
    try {
      await deletePortfolioImage(proProfile.public_id, imgId);
      setPortfolioImages((prev) => prev.filter((img) => img.id !== imgId));
    } catch { /* ignore */ }
  };

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user) { navigate('/login'); return null; }

  return (
    <div className="section">
      <div className="container">
        <div className="detail-layout">
          <div className="detail-main">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="avatar avatar-lg">
                {(user.avatar || user.avatar_url) ? <img src={user.avatar || user.avatar_url} alt="" /> : <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>}
                <label className="avatar-upload">
                  <Edit size={14} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              </div>
              <div>
                <h1>{user.first_name} {user.last_name}</h1>
                <p className="text-muted">
                  <Mail size={14} /> {user.email}
                  {user.is_email_verified
                    ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email verified" />
                    : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email not verified" />}
                </p>
                {user.phone && (
                  <p className="text-muted">
                    <Phone size={14} /> {user.phone}
                    {user.is_phone_verified
                      ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone verified" />
                      : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone not verified" />}
                  </p>
                )}
                {user.city && <p className="text-muted"><MapPin size={14} /> {user.city}</p>}
                {user.is_professional && <span className="badge badge-blue">Professional</span>}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
                <Edit size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Edit Form */}
            {editing && (
              <form className="form-card" onSubmit={handleSave}>
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            )}

            {/* Social Links */}
            <div className="detail-section">
              <div className="section-header-row">
                <h2><Link2 size={20} /> Social Links</h2>
              </div>
              {socialLinks.length > 0 && (
                <div className="social-links-list">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="social-link-row">
                      {platformIcon(link.platform)}
                      <span className="social-link-label">{PLATFORM_LABELS[link.platform]}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="social-link-url">{link.url}</a>
                      <button className="btn-icon" onClick={() => handleDeleteSocialLink(link.id)} title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {availablePlatforms.length > 0 && (
                <form className="social-link-form" onSubmit={handleAddSocialLink}>
                  {socialError && <div className="alert alert-error">{socialError}</div>}
                  <div className="social-link-form-row">
                    <select
                      value={socialForm.platform}
                      onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                      required
                    >
                      <option value="">Platform</option>
                      {availablePlatforms.map((p) => (
                        <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={socialForm.url}
                      onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Add</button>
                  </div>
                </form>
              )}
            </div>

            {/* Professional Profile */}
            {proProfile && (
              <div className="detail-section">
                <div className="section-header-row">
                  <h2>Professional Profile</h2>
                  <button
                    className={`btn btn-sm ${proProfile.is_active ? 'btn-outline' : 'btn-primary'}`}
                    onClick={async () => {
                      try {
                        await updateProfessionalProfile(proProfile.public_id, { is_active: !proProfile.is_active });
                        setProProfile({ ...proProfile, is_active: !proProfile.is_active });
                      } catch { /* ignore */ }
                    }}
                  >
                    {proProfile.is_active ? 'Disable Listing' : 'Enable Listing'}
                  </button>
                </div>
                {!proProfile.is_active && (
                  <div className="alert alert-error" style={{ marginBottom: '10px' }}>
                    Your profile is hidden from the marketplace. Click "Enable Listing" to make it visible again.
                  </div>
                )}
                <Link to={`/professionals/${proProfile.public_id}`} className="pro-card">
                  <h3>{proProfile.headline}</h3>
                  <div className="pro-card-meta">
                    {proProfile.avg_rating ? <StarRating rating={proProfile.avg_rating} /> : <span className="text-muted">No ratings</span>}
                    <span>({proProfile.review_count || 0} reviews)</span>
                    {proProfile.is_verified && <span className="badge badge-green">Verified</span>}
                    {!proProfile.is_active && <span className="badge badge-gray">Hidden</span>}
                  </div>
                  <div className="pro-card-tags">
                    {proProfile.services?.map((s) => <span key={s.id} className="tag">{s.name}</span>)}
                  </div>
                </Link>
              </div>
            )}

            {/* Portfolio Management */}
            {proProfile && (
              <div className="detail-section">
                <div className="section-header-row">
                  <h2><ImagePlus size={20} /> Portfolio ({portfolioImages.length}/10)</h2>
                  {portfolioImages.length < 10 && (
                    <label className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>
                      {portfolioUploading ? 'Uploading...' : 'Add Photos'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={portfolioUploading}
                        onChange={handlePortfolioUpload}
                      />
                    </label>
                  )}
                </div>
                {portfolioImages.length === 0 ? (
                  <p className="text-muted">No portfolio photos yet. Add up to 10 photos to showcase your work.</p>
                ) : (
                  <div className="portfolio-grid">
                    {portfolioImages.map((img) => (
                      <div key={img.id} className="portfolio-item">
                        <img src={img.image} alt="Portfolio" className="portfolio-img" />
                        <button
                          className="portfolio-delete-btn"
                          onClick={() => handlePortfolioDelete(img.id)}
                          title="Remove photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!user.is_professional && (
              <div className="detail-section">
                <div className="cta-card">
                  <h2>Become a Professional</h2>
                  <p>Create your professional profile and start connecting with clients.</p>
                  <Link to="/become-professional" className="btn btn-primary">Get Started</Link>
                </div>
              </div>
            )}

            {/* My Jobs */}
            <div className="detail-section">
              <div className="section-header-row">
                <h2><Briefcase size={20} /> My Job Postings</h2>
                <Link to="/jobs/create" className="btn btn-sm btn-outline">Post a Job</Link>
              </div>
              {myJobs.length === 0 ? (
                <p className="text-muted">You haven't posted any jobs yet.</p>
              ) : (
                <div className="jobs-list compact">
                  {myJobs.slice(0, 5).map((job) => (
                    <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                      <h3>{job.title}</h3>
                      <div className="job-card-meta">
                        <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span>
                        <span>{job.city}</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Received */}
            <div className="detail-section">
              <h2><Star size={20} /> Reviews About Me</h2>
              {receivedReviews.length === 0 ? (
                <p className="text-muted">You haven't received any reviews yet.</p>
              ) : (
                <div className="reviews-list">
                  {receivedReviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        {r.reviewer
                          ? <strong>From: {r.reviewer.first_name} {r.reviewer.last_name}</strong>
                          : <strong className="text-muted">From: Anonymous</strong>}
                        <StarRating rating={r.rating} size={14} />
                        <span className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews I've Given */}
            <div className="detail-section">
              <h2><Star size={20} /> Reviews I've Given</h2>
              {myReviews.length === 0 ? (
                <p className="text-muted">You haven't written any reviews yet.</p>
              ) : (
                <div className="reviews-list">
                  {myReviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        <strong>To: {r.reviewed_user?.first_name} {r.reviewed_user?.last_name}</strong>
                        <StarRating rating={r.rating} size={14} />
                        {r.is_anonymous && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Anonymous</span>}
                        <span className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3><User size={16} /> Quick Stats</h3>
              <p>Jobs Posted: {myJobs.length}</p>
              <p>Reviews Given: {myReviews.length}</p>
              <p>Reviews Received: {receivedReviews.length}</p>
              <p>Member since: {new Date(user.date_joined).toLocaleDateString()}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
