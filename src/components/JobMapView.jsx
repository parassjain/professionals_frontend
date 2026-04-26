import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getJobsMap } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign } from 'lucide-react';
import './MapView.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FALLBACK_LOCATION = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM = 13;

function makeIcon(active) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker ${active ? 'map-marker--active' : ''}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: () => onBoundsChange(),
    zoomend: () => onBoundsChange(),
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? DEFAULT_ZOOM, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export default function JobMapView({ category }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const listRef = useRef(null);

  const fetchInBounds = useCallback((mapInstance, cat) => {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    setLoading(true);
    getJobsMap({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      ...(cat ? { category: cat } : {}),
    })
      .then((r) => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const debouncedFetch = useDebounce(
    () => fetchInBounds(mapRef.current, category),
    400,
  );

  useEffect(() => {
    if (mapRef.current) fetchInBounds(mapRef.current, category);
  }, [category, fetchInBounds]);

  useEffect(() => {
    const fallbackToCity = () => {
      const city = user?.city;
      if (city) {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`)
          .then((r) => r.json())
          .then((data) => {
            if (data.length > 0) {
              setFlyTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: DEFAULT_ZOOM });
            } else {
              setFlyTarget({ ...FALLBACK_LOCATION, zoom: DEFAULT_ZOOM });
            }
          })
          .catch(() => setFlyTarget({ ...FALLBACK_LOCATION, zoom: DEFAULT_ZOOM }));
      } else {
        setFlyTarget({ ...FALLBACK_LOCATION, zoom: DEFAULT_ZOOM });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFlyTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: DEFAULT_ZOOM }),
        fallbackToCity,
        { timeout: 5000 },
      );
    } else {
      fallbackToCity();
    }
  }, [user]);

  const handleMarkerClick = (job) => {
    setActiveId(job.id);
    const el = listRef.current?.querySelector(`[data-id="${job.id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleCardClick = (job) => {
    setActiveId(job.id);
    setFlyTarget({ lat: parseFloat(job.latitude), lng: parseFloat(job.longitude), zoom: DEFAULT_ZOOM });
    setTimeout(() => markerRefs.current[job.id]?.openPopup(), 400);
  };

  const count = jobs.length;

  return (
    <div className="map-view">
      <div className="map-panel" ref={listRef}>
        <div className="map-panel-header">
          <Briefcase size={16} />
          <span>
            {loading ? 'Updating…' : `${count} job${count !== 1 ? 's' : ''} in this area`}
          </span>
        </div>
        {jobs.length === 0 && !loading ? (
          <div className="map-panel-empty">
            <p>No open jobs found in this area.</p>
            <p className="text-muted">Try zooming out or changing filters.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              data-id={job.id}
              className={`map-pro-card ${activeId === job.id ? 'map-pro-card--active' : ''}`}
              onClick={() => handleCardClick(job)}
            >
              <div className="map-pro-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', flexShrink: 0 }}>
                  <Briefcase size={16} color="var(--primary)" />
                </div>
                <div className="map-pro-card-info">
                  <strong>{job.title}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                    {job.category && <span className="tag">{job.category.name}</span>}
                    <span className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={11} /> {job.city}
                    </span>
                    {job.budget_range && (
                      <span className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <DollarSign size={11} /> {job.budget_range}
                      </span>
                    )}
                  </div>
                  <span className="text-muted text-sm">{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                to={`/jobs/${job.id}`}
                className="btn btn-sm btn-outline map-pro-view-btn"
                onClick={(e) => e.stopPropagation()}
              >
                View Job
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="map-container-wrapper">
        <MapContainer
          center={[FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng]}
          zoom={DEFAULT_ZOOM}
          className="leaflet-map"
          ref={mapRef}
          whenReady={(map) => {
            mapRef.current = map.target;
            fetchInBounds(map.target, category);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsWatcher onBoundsChange={debouncedFetch} />
          {flyTarget && <FlyTo target={flyTarget} />}
          {jobs.map((job) => (
            <Marker
              key={job.id}
              position={[parseFloat(job.latitude), parseFloat(job.longitude)]}
              icon={makeIcon(activeId === job.id)}
              ref={(ref) => { markerRefs.current[job.id] = ref; }}
              eventHandlers={{ click: () => handleMarkerClick(job) }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-header">
                    <Briefcase size={16} color="var(--primary)" />
                    <div>
                      <strong>{job.title}</strong>
                      <p className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MapPin size={11} /> {job.city}
                      </p>
                    </div>
                  </div>
                  {job.budget_range && (
                    <p className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.25rem 0' }}>
                      <DollarSign size={11} /> {job.budget_range}
                    </p>
                  )}
                  {job.category && (
                    <div style={{ margin: '0.4rem 0' }}>
                      <span className="tag">{job.category.name}</span>
                    </div>
                  )}
                  <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                    View Job
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
