import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfessional, getReviews, createReview } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Shield, Star } from 'lucide-react';
import StarRating from '../components/StarRating';
import StarInput from '../components/StarInput';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfessionalDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [pro, setPro] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      await createReview({ reviewed_user: pro.user.id, ...reviewForm });
      const revRes = await getReviews({ reviewed_user: pro.user.id });
      setReviews(revRes.data.results || revRes.data);
      setReviewForm({ rating: 5, comment: '' });
      // Refresh pro to update avg rating
      const proRes = await getProfessional(id);
      setPro(proRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!pro) return <div className="section container"><p>Professional not found.</p></div>;

  const canReview = isAuthenticated && user?.id !== pro.user.id;
  const alreadyReviewed = reviews.some((r) => r.reviewer?.id === user?.id);

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
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        <div className="avatar avatar-sm">
                          <span>{r.reviewer?.first_name?.[0]}{r.reviewer?.last_name?.[0]}</span>
                        </div>
                        <div>
                          <strong>{r.reviewer?.first_name} {r.reviewer?.last_name}</strong>
                          <StarRating rating={r.rating} size={14} />
                        </div>
                        <span className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p>{r.comment}</p>}
                    </div>
                  ))}
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
          </aside>
        </div>
      </div>
    </div>
  );
}
