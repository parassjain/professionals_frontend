import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getJob, deleteJob } from '../api/endpoints';
import { SITE_URL, SITE_NAME } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, DollarSign, Tag, User, Trash2, Edit, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJob(id)
      .then((r) => setJob(r.data))
      .catch(() => setError('Failed to load job.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(id);
      navigate('/jobs');
    } catch (err) {
      setError('Failed to delete job.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="section container"><p>Job not found.</p></div>;
  if (error) return <div className="section container"><div className="alert alert-error">{error}</div></div>;

  const isOwner = user?.public_id === job.posted_by?.public_id;
  const categoryName = job.category?.name || 'Service';
  const metaTitle = `${job.title} — ${categoryName} job in ${job.city} | ${SITE_NAME}`;
  const metaDesc = `Looking for a ${categoryName} in ${job.city}. ${job.description?.slice(0, 150) || ''}`;

  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.created_at?.split('T')[0],
    employmentType: 'CONTRACTOR',
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.city, addressCountry: 'IN' } },
    hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL },
    occupationalCategory: categoryName,
    ...(job.budget_range && { estimatedSalary: job.budget_range }),
  };

  return (
    <div className="section">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`${SITE_URL}/jobs/${job.id}`} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <script type="application/ld+json">{JSON.stringify(jobSchema)}</script>
      </Helmet>
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
            <Link to={`/users/${job.posted_by?.public_id}`} className="poster-link">
              <User size={16} /> {job.posted_by?.first_name} {job.posted_by?.last_name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
