import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, deleteJob } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, DollarSign, Tag, User, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJob(id)
      .then((r) => setJob(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(id);
      navigate('/jobs');
    } catch { /* ignore */ }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="section container"><p>Job not found.</p></div>;

  const isOwner = user?.id === job.posted_by?.id;

  return (
    <div className="section">
      <div className="container container-md">
        <div className="job-detail-card">
          <div className="job-detail-header">
            <div>
              <h1>{job.title}</h1>
              <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{job.status}</span>
            </div>
            {isOwner && (
              <div className="action-btns">
                <Link to={`/jobs/${id}/edit`} className="btn btn-sm btn-outline"><Edit size={16} /> Edit</Link>
                <button className="btn btn-sm btn-danger" onClick={handleDelete}><Trash2 size={16} /> Delete</button>
              </div>
            )}
          </div>

          <div className="job-detail-meta">
            {job.category && <span><Tag size={16} /> {job.category.name}</span>}
            <span><MapPin size={16} /> {job.city}</span>
            {job.budget_range && <span><DollarSign size={16} /> {job.budget_range}</span>}
            <span><Calendar size={16} /> Posted {new Date(job.created_at).toLocaleDateString()}</span>
          </div>

          <div className="job-detail-body">
            <h2>Description</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
          </div>

          <div className="job-detail-poster">
            <h3>Posted by</h3>
            <Link to={`/users/${job.posted_by?.id}`} className="poster-link">
              <User size={16} /> {job.posted_by?.first_name} {job.posted_by?.last_name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
