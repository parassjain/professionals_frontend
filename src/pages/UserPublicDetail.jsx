import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicUser, getUserContact } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { MapPin, Mail, Phone, Globe, Code, Link2, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const PLATFORM_ICONS = {
  github: <Code size={14} />,
  linkedin: <Link2 size={14} />,
};
const PLATFORM_LABELS = {
  facebook: 'Facebook', linkedin: 'LinkedIn', twitter: 'Twitter / X',
  github: 'GitHub', instagram: 'Instagram', youtube: 'YouTube', website: 'Website',
};

export default function UserPublicDetail() {
  const { public_id } = useParams();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    getPublicUser(public_id)
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [public_id]);

  const handleRevealContact = async () => {
    setContactLoading(true);
    setContactError('');
    try {
      const res = await getUserContact(public_id);
      setContact(res.data);
    } catch (err) {
      setContactError(err.response?.data?.detail || 'Could not load contact info.');
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="section container"><p>User not found.</p></div>;


  return (
    <div className="section">
      <div className="container container-md">
        <div className="detail-layout" style={{ gridTemplateColumns: '1fr auto' }}>
          <div className="detail-main">
            {/* Header */}
            <div className="pro-detail-header">
              <div className="avatar avatar-lg">
                {(profile.avatar || profile.avatar_url)
                  ? <img src={profile.avatar || profile.avatar_url} alt="" />
                  : <span>{profile.first_name?.[0]}{profile.last_name?.[0]}</span>}
              </div>
              <div>
                <h1>{profile.first_name} {profile.last_name}</h1>
                {profile.city && (
                  <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0' }}>
                    <MapPin size={14} /> {profile.city}
                  </p>
                )}
                {profile.is_professional && (
                  <Link to={`/professionals?search=${profile.first_name}`} className="badge badge-green" style={{ marginTop: '6px', display: 'inline-block' }}>
                    Professional
                  </Link>
                )}
              </div>
            </div>

            {/* Social Links */}
            {profile.social_links?.length > 0 && (
              <div className="detail-section">
                <h2>Social Links</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profile.social_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}
                    >
                      {PLATFORM_ICONS[link.platform] || <Globe size={14} />}
                      {PLATFORM_LABELS[link.platform] || link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="detail-section">
              <h2>Contact</h2>

              {contact ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {contact.email ? (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} />
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      <CheckCircle size={13} color="#22c55e" title="Verified" />
                    </p>
                  ) : null}
                  {contact.phone ? (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} />
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      <CheckCircle size={13} color="#22c55e" title="Verified" />
                    </p>
                  ) : null}
                  {!contact.email && !contact.phone && (
                    <p className="text-muted">This user has no verified contact info yet.</p>
                  )}
                </div>
              ) : !isAuthenticated ? (
                <div>
                  <p className="text-muted" style={{ marginBottom: '10px' }}>Log in to view contact info.</p>
                  <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                </div>
              ) : (
                <div>
                  <p className="text-muted" style={{ marginBottom: '10px' }}>
                    {profile.is_email_verified && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Mail size={14} /> Email verified <CheckCircle size={13} color="#22c55e" />
                      </span>
                    )}
                    {profile.is_phone_verified && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} /> Phone verified <CheckCircle size={13} color="#22c55e" />
                      </span>
                    )}
                  </p>
                  {contactError && <p style={{ color: '#ef4444', marginBottom: '8px' }}>{contactError}</p>}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleRevealContact}
                    disabled={contactLoading || !!contactError}
                  >
                    {contactLoading ? 'Loading...' : 'View Contact Info'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Details</h3>
              <p className="text-muted text-sm">Member since {new Date(profile.date_joined).toLocaleDateString()}</p>
              {profile.is_email_verified
                ? <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><CheckCircle size={14} color="#22c55e" /> Email verified</p>
                : <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><XCircle size={14} color="#94a3b8" /> Email not verified</p>}
              {profile.is_phone_verified
                ? <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><CheckCircle size={14} color="#22c55e" /> Phone verified</p>
                : <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}><XCircle size={14} color="#94a3b8" /> Phone not verified</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
