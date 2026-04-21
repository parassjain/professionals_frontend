import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicUser } from '../api/endpoints';
import { MapPin, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserPublicDetail() {
  const { public_id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicUser(public_id)
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [public_id]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="section container"><p>User not found.</p></div>;

  return (
    <div className="section">
      <div className="container container-md">
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="avatar avatar-lg">
              {(profile.avatar || profile.avatar_url)
                ? <img src={profile.avatar || profile.avatar_url} alt="" />
                : <span>{profile.first_name?.[0]}{profile.last_name?.[0]}</span>}
            </div>
            <div>
              <h1 style={{ margin: 0 }}>{profile.first_name} {profile.last_name}</h1>
              {profile.city && (
                <p className="text-muted" style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {profile.city}
                </p>
              )}
            </div>
          </div>

          {profile.is_professional && (
            <Link to={`/professionals?user=${public_id}`} className="btn btn-primary btn-sm">
              View Professional Profile
            </Link>
          )}

          {!profile.is_professional && (
            <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> Regular member
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
