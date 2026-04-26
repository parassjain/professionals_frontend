import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProfessional, getReviews, createReview, updateReview, revealContact } from '../api/endpoints';
import { SITE_URL, SITE_NAME } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Shield, Star, CheckCircle, XCircle, Code, Globe, Link2, AlertCircle } from 'lucide-react';
import StarRating from '../components/StarRating';
import StarInput from '../components/StarInput';
import LoadingSpinner from '../components/LoadingSpinner';

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const CONTACT_REVEAL_COOLDOWN_MS = 30000;

export default function ProfessionalDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', is_anonymous: false });
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '', is_anonymous: false });
  const [editError, setEditError] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const contactRevealTime = useRef(0);

  const validateImage = (file) => {
    if (!file) return null;
    if (file.size > MAX_IMAGE_SIZE_BYTES) return `Image must be less than ${MAX_IMAGE_SIZE_MB}MB`;
    if (!file.type.startsWith('image/')) return 'File must be an image';
    return null;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfessional(id),
      getReviews({ reviewed_user: null })
    ])
      .then(([proRes]) => {
        setPro(proRes.data);
        return getReviews({ reviewed_user: proRes.data.user.public_id });
      })
      .then((revRes) => setReviews(revRes.data.results || revRes.data))
      .catch(() => setError('Failed to load professional.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('reviewed_user', pro.user.public_id);
      fd.append('rating', reviewForm.rating);
      fd.append('comment', reviewForm.comment);
      fd.append('is_anonymous', reviewForm.is_anonymous);
      if (reviewImage) fd.append('image', reviewImage);
      await createReview(fd);
      const revRes = await getReviews({ reviewed_user: pro.user.public_id });
      setReviews(revRes.data.results || revRes.data);
      setReviewForm({ rating: 5, comment: '', is_anonymous: false });
      setReviewImage(null);
      // Refresh pro to update avg rating
      const proRes = await getProfessional(id);
      setPro(proRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('rating', editForm.rating);
      fd.append('comment', editForm.comment);
      fd.append('is_anonymous', editForm.is_anonymous);
      if (editImage) fd.append('image', editImage);
      await updateReview(editingReviewId, fd);
      const revRes = await getReviews({ reviewed_user: pro.user.public_id });
      setReviews(revRes.data.results || revRes.data);
      setEditingReviewId(null);
      setEditImage(null);
      const proRes = await getProfessional(id);
      setPro(proRes.data);
    } catch (err) {
      setEditError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to update review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealContact = async () => {
    const now = Date.now();
    if (now - contactRevealTime.current < CONTACT_REVEAL_COOLDOWN_MS) {
      setContactError(`Please wait ${Math.ceil((CONTACT_REVEAL_COOLDOWN_MS - (now - contactRevealTime.current)) / 1000)} seconds before revealing again.`);
      return;
    }
    contactRevealTime.current = now;
    setContactLoading(true);
    setContactError('');
    try {
      const res = await revealContact(id);
      setContactInfo(res.data);
    } catch (err) {
      setContactError(err.response?.data?.detail || 'Could not load contact info.');
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!pro) return <div className="section container"><p>Professional not found.</p></div>;

  const canReview = isAuthenticated && user?.public_id !== pro.user.public_id;
  const alreadyReviewed = reviews.some((r) => r.reviewer?.public_id === user?.public_id);
  const profileComplete = !!(user?.email && user?.phone);

  const fullName = `${pro.user?.first_name || ''} ${pro.user?.last_name || ''}`.trim();
  const city = pro.user?.city || '';
  const serviceNames = pro.services?.map((s) => s.name).join(', ') || pro.headline;
  const avatarUrl = pro.user?.avatar_url || pro.user?.avatar || '';
  const avgRating = pro.avg_rating ? parseFloat(pro.avg_rating).toFixed(1) : null;
  const reviewCount = pro.review_count || 0;
  const metaDesc = `${fullName} is a ${serviceNames}${city ? ` in ${city}` : ''}. ${pro.bio ? pro.bio.slice(0, 120) : pro.headline}. View profile, read ${reviewCount} reviews, get contact info on ContactHub.`;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'LocalBusiness'],
    name: fullName,
    description: pro.bio ? pro.bio.slice(0, 300) : pro.headline,
    jobTitle: pro.headline,
    url: `${SITE_URL}/professionals/${pro.public_id}`,
    ...(avatarUrl && { image: avatarUrl }),
    ...(city && { address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'IN' } }),
    ...(avgRating && reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: String(reviewCount),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    knowsAbout: pro.services?.map((s) => s.name) || [],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Professionals', item: `${SITE_URL}/professionals` },
      { '@type': 'ListItem', position: 3, name: fullName, item: `${SITE_URL}/professionals/${pro.public_id}` },
    ],
  };

  return (
    <div className="section">
      <Helmet>
        <title>{`${fullName} — ${pro.headline} | ${SITE_NAME}`}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`${SITE_URL}/professionals/${pro.public_id}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${fullName} | ${SITE_NAME}`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={`${SITE_URL}/professionals/${pro.public_id}`} />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
        {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
        <script type="application/ld+json">{JSON.stringify(personSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <div className="container">
        <div className="detail-layout">
          {/* Main Info */}
          <div className="detail-main">
            <div className="pro-detail-header">
              <div className="avatar avatar-lg">
                {(pro.user?.avatar || pro.user?.avatar_url) ? <img src={pro.user.avatar || pro.user.avatar_url} alt={`${fullName} profile photo`} loading="eager" /> : <span>{pro.user?.first_name?.[0]}{pro.user?.last_name?.[0]}</span>}
              </div>
              <div>
                <h1>{pro.user?.first_name} {pro.user?.last_name}</h1>
                <p className="headline">{pro.headline}</p>
                <div className="pro-card-meta">
                  {pro.avg_rating ? (
                    <>
                      <StarRating rating={pro.avg_rating} size={20} />
                      <span>{Number(pro.avg_rating).toFixed(1)} ({pro.review_count} reviews)</span>
                    </>
                  ) : (
                    <span className="text-muted">No reviews yet</span>
                  )}
                  {pro.is_verified && <span className="badge badge-green"><Shield size={14} /> Verified</span>}
                </div>
              </div>
            </div>

            {pro.bio && (
              <div className="detail-section">
                <h2>About</h2>
                <p>{pro.bio}</p>
              </div>
            )}

            <div className="detail-section">
              <h2>Services</h2>
              <div className="pro-card-tags">
                {pro.services?.map((s) => (
                  <Link to={`/professionals?category=${s.slug}`} key={s.id} className="tag tag-link">{s.name}</Link>
                ))}
                {(!pro.services || pro.services.length === 0) && <p className="text-muted">No services listed</p>}
              </div>
            </div>

            {/* Portfolio */}
            {pro.portfolio_images?.length > 0 && (
              <div className="detail-section">
                <h2>Portfolio</h2>
                <div className="portfolio-grid">
                  {pro.portfolio_images.map((img) => (
                    <img key={img.id} src={img.image} alt="Portfolio" className="portfolio-img" />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="detail-section">
              <h2>Reviews ({reviews.length})</h2>

              {canReview && !alreadyReviewed && !profileComplete && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  You need a phone number on your account before leaving a review.{' '}
                  <Link to="/profile">Complete your profile →</Link>
                </div>
              )}

              {canReview && !alreadyReviewed && profileComplete && (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h3>Leave a Review</h3>
                  {reviewError && <div className="alert alert-error">{reviewError}</div>}
                  <div className="form-group">
                    <label>Rating</label>
                    <StarInput value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Photo (optional, max 2MB)</label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0] || null; const err = validateImage(f); if (err) setReviewError(err); else setReviewImage(f); }} />
                  </div>
                  <label className="anonymous-toggle">
                    <input
                      type="checkbox"
                      checked={reviewForm.is_anonymous}
                      onChange={(e) => setReviewForm({ ...reviewForm, is_anonymous: e.target.checked })}
                    />
                    Post anonymously
                  </label>
                  {reviewForm.is_anonymous && (
                    <p className="anonymous-note">Your name will be hidden from other users. Admins can still see your identity.</p>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => {
                    const isOwn = r.reviewer?.public_id === user?.public_id;
                    const isEditing = editingReviewId === r.id;

                    return (
                      <div key={r.id} className="review-card">
                        <div className="review-header">
                          <div className="avatar avatar-sm">
                            <span>{r.is_anonymous ? '?' : (r.reviewer?.first_name?.[0] || '?')}{r.is_anonymous ? '' : r.reviewer?.last_name?.[0]}</span>
                          </div>
                          <div>
                            <strong>
                              {r.is_anonymous ? 'Anonymous' : `${r.reviewer?.first_name} ${r.reviewer?.last_name}`}
                              {r.is_anonymous && isOwn && <span className="badge badge-gray" style={{ marginLeft: '6px', fontSize: '0.7rem' }}>you</span>}
                            </strong>
                            {!isEditing && <StarRating rating={r.rating} size={14} />}
                          </div>
                          <span className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                          {isOwn && !isEditing && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setEditForm({ rating: r.rating, comment: r.comment, is_anonymous: r.is_anonymous });
                                setEditError('');
                                setEditingReviewId(r.id);
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <form onSubmit={handleEditSubmit}>
                            {editError && <div className="alert alert-error">{editError}</div>}
                            <div className="form-group">
                              <label>Rating</label>
                              <StarInput value={editForm.rating} onChange={(v) => setEditForm({ ...editForm, rating: v })} />
                            </div>
                            <div className="form-group">
                              <label>Comment</label>
                              <textarea
                                value={editForm.comment}
                                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div className="form-group">
                              <label>Photo</label>
                              {r.image && !editImage && (
                                <img src={r.image} alt="Current review photo" style={{ display: 'block', maxWidth: '200px', marginBottom: '6px', borderRadius: '6px' }} />
                              )}
                              {editImage && (
                                <img src={URL.createObjectURL(editImage)} alt="New review photo" style={{ display: 'block', maxWidth: '200px', marginBottom: '6px', borderRadius: '6px' }} />
                              )}
                              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0] || null; const err = validateImage(f); if (err) setEditError(err); else setEditImage(f); }} />
                            </div>
                            <label className="anonymous-toggle">
                              <input
                                type="checkbox"
                                checked={editForm.is_anonymous}
                                onChange={(e) => setEditForm({ ...editForm, is_anonymous: e.target.checked })}
                              />
                              Post anonymously
                            </label>
                            {editForm.is_anonymous && (
                              <p className="anonymous-note">Your name will be hidden from other users. Admins can still see your identity.</p>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save'}
                              </button>
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditingReviewId(null); setEditImage(null); }}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            {r.comment && <p>{r.comment}</p>}
                            {r.image && <img src={r.image} alt="Review photo" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginTop: '8px' }} />}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Details</h3>
              {pro.years_experience > 0 && (
                <p><Clock size={16} /> {pro.years_experience} years experience</p>
              )}
              {(pro.address || pro.user?.city) && (
                <p><MapPin size={16} /> {pro.address || pro.user?.city}</p>
              )}
              <p><Star size={16} /> {pro.review_count || 0} reviews</p>
              <p>Member since {new Date(pro.created_at).toLocaleDateString()}</p>
            </div>

            <div className="sidebar-card">
              <h3>Contact Info</h3>
              {contactInfo ? (
                <>
                  {contactInfo.email && (
                    <p style={{ wordBreak: 'break-all' }}>
                      {contactInfo.email}
                      {pro.user?.is_email_verified
                        ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email verified" />
                        : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email not verified" />}
                    </p>
                  )}
                  {contactInfo.phone && (
                    <p>
                      {contactInfo.phone}
                      {pro.user?.is_phone_verified
                        ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone verified" />
                        : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone not verified" />}
                    </p>
                  )}
                  {pro.user?.social_links?.length > 0 && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      {pro.user.social_links.map((link) => {
                        const LABELS = { facebook: 'Facebook', linkedin: 'LinkedIn', twitter: 'Twitter / X', github: 'GitHub', instagram: 'Instagram', youtube: 'YouTube', website: 'Website' };
                        const icon = link.platform === 'github' ? <Code size={14} />
                          : link.platform === 'linkedin' ? <Link2 size={14} />
                          : <Globe size={14} />;
                        return (
                          <p key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {icon}
                            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all', fontSize: '0.875rem' }}>
                              {LABELS[link.platform] || link.platform}
                            </a>
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {!contactInfo.email && !contactInfo.phone && !pro.user?.social_links?.length && (
                    <p className="text-muted">No contact info available.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-muted">
                    {pro.masked_email}
                    {pro.user?.is_email_verified
                      ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email verified" />
                      : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Email not verified" />}
                  </p>
                  {pro.masked_phone && (
                    <p className="text-muted">
                      {pro.masked_phone}
                      {pro.user?.is_phone_verified
                        ? <CheckCircle size={13} color="#22c55e" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone verified" />
                        : <XCircle size={13} color="#94a3b8" style={{ marginLeft: '5px', verticalAlign: 'middle' }} title="Phone not verified" />}
                    </p>
                  )}
                  {pro.user?.social_links?.length > 0 && (
                    <p className="text-muted text-sm" style={{ marginTop: '6px' }}>
                      + {pro.user.social_links.length} social link{pro.user.social_links.length > 1 ? 's' : ''}
                    </p>
                  )}
                  {contactError && <p className="text-muted text-sm" style={{ marginTop: '6px', color: '#ef4444' }}>{contactError}</p>}
                  {isAuthenticated && !profileComplete ? (
                    <p className="text-muted text-sm" style={{ marginTop: '8px' }}>
                      Add your phone number to <Link to="/profile">your profile</Link> to view contact info.
                    </p>
                  ) : isAuthenticated ? (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '8px', width: '100%' }}
                      onClick={handleRevealContact}
                      disabled={contactLoading || !!contactError}
                    >
                      {contactLoading ? 'Loading...' : 'View Contact Info'}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-outline btn-sm" style={{ marginTop: '8px', display: 'block', textAlign: 'center' }}>
                      Login to view contact info
                    </Link>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
