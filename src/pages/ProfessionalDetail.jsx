import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfessional, getReviews, createReview, updateReview, revealContact } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Shield, Star, CheckCircle, XCircle } from 'lucide-react';
import StarRating from '../components/StarRating';
import StarInput from '../components/StarInput';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfessionalDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    Promise.all([
      getProfessional(id),
      getReviews({ reviewed_user: null }) // we'll filter after getting pro
    ])
      .then(([proRes]) => {
        setPro(proRes.data);
        // Fetch reviews for this professional's user
        return getReviews({ reviewed_user: proRes.data.user.id });
      })
      .then((revRes) => setReviews(revRes.data.results || revRes.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('reviewed_user', pro.user.id);
      fd.append('rating', reviewForm.rating);
      fd.append('comment', reviewForm.comment);
      fd.append('is_anonymous', reviewForm.is_anonymous);
      if (reviewImage) fd.append('image', reviewImage);
      await createReview(fd);
      const revRes = await getReviews({ reviewed_user: pro.user.id });
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
      const revRes = await getReviews({ reviewed_user: pro.user.id });
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

  return (
    <div className="section">
      <div className="container">
        <div className="detail-layout">
          {/* Main Info */}
          <div className="detail-main">
            <div className="pro-detail-header">
              <div className="avatar avatar-lg">
                {(pro.user?.avatar || pro.user?.avatar_url) ? <img src={pro.user.avatar || pro.user.avatar_url} alt="" /> : <span>{pro.user?.first_name?.[0]}{pro.user?.last_name?.[0]}</span>}
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

              {canReview && !alreadyReviewed && (
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
                    <label>Photo (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setReviewImage(e.target.files[0] || null)} />
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
                              <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files[0] || null)} />
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
                  {!contactInfo.email && !contactInfo.phone && <p className="text-muted">No contact info available.</p>}
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
                  {contactError && <p className="text-muted text-sm" style={{ marginTop: '6px', color: '#ef4444' }}>{contactError}</p>}
                  {isAuthenticated ? (
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
