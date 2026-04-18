import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUser, updateCurrentUserWithFile, getProfessionals, getJobs, getReviews } from '../api/endpoints';
import { User, Mail, Phone, MapPin, Edit, Briefcase, Star, CheckCircle, XCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '', city: user.city || '' });

    const fetches = [
      getJobs({ posted_by: user.id }).catch(() => ({ data: { results: [] } })),
      getReviews({ reviewer: user.id }).catch(() => ({ data: { results: [] } })),
    ];

    if (user.is_professional) {
      fetches.push(
        getProfessionals({ search: user.first_name }).catch(() => ({ data: { results: [] } }))
      );
    }

    Promise.all(fetches)
      .then(([jobsRes, reviewsRes, prosRes]) => {
        setMyJobs(jobsRes.data.results || jobsRes.data || []);
        setMyReviews(reviewsRes.data.results || reviewsRes.data || []);
        if (prosRes) {
          const pros = prosRes.data.results || prosRes.data || [];
          const myPro = pros.find((p) => p.user?.id === user.id);
          setProProfile(myPro || null);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

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

            {/* Professional Profile */}
            {proProfile && (
              <div className="detail-section">
                <h2>Professional Profile</h2>
                <Link to={`/professionals/${proProfile.id}`} className="pro-card">
                  <h3>{proProfile.headline}</h3>
                  <div className="pro-card-meta">
                    {proProfile.avg_rating ? <StarRating rating={proProfile.avg_rating} /> : <span className="text-muted">No ratings</span>}
                    <span>({proProfile.review_count || 0} reviews)</span>
                    {proProfile.is_verified && <span className="badge badge-green">Verified</span>}
                  </div>
                  <div className="pro-card-tags">
                    {proProfile.services?.map((s) => <span key={s.id} className="tag">{s.name}</span>)}
                  </div>
                </Link>
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

            {/* My Reviews */}
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
              <p>Member since: {new Date(user.date_joined).toLocaleDateString()}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
