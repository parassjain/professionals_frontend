import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getProfessionalsMap } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import { Sparkles, MapPin } from 'lucide-react';
import './MapView.css';

// Fix default leaflet marker icon broken by webpack/vite bundling
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

// Debounce helper
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// Component that listens to map move/zoom events and triggers fetch
function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: () => onBoundsChange(),
    zoomend: () => onBoundsChange(),
  });
  return null;
}

// Component that pans/zooms the map to a target position
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom ?? DEFAULT_ZOOM, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

export default function MapView({ category }) {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const listRef = useRef(null);

  // Fetch professionals visible in the current map bounds
  const fetchInBounds = useCallback((mapInstance, cat) => {
    if (!mapInstance) return;
    const bounds = mapInstance.getBounds();
    setLoading(true);
    getProfessionalsMap({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      ...(cat ? { category: cat } : {}),
    })
      .then((r) => setProfessionals(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const debouncedFetch = useDebounce(
    () => fetchInBounds(mapRef.current, category),
    400,
  );

  // Re-fetch when category filter changes
  useEffect(() => {
    if (mapRef.current) fetchInBounds(mapRef.current, category);
  }, [category, fetchInBounds]);

  // On mount: try browser geolocation → stored city → Bangalore
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

  const handleMarkerClick = (pro) => {
    setActiveId(pro.public_id);
    // Scroll matching card into view in side panel
    const el = listRef.current?.querySelector(`[data-id="${pro.public_id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleCardClick = (pro) => {
    setActiveId(pro.public_id);
    setFlyTarget({ lat: parseFloat(pro.latitude), lng: parseFloat(pro.longitude), zoom: DEFAULT_ZOOM });
    // Open popup on marker
    setTimeout(() => markerRefs.current[pro.public_id]?.openPopup(), 400);
  };

  const count = professionals.length;

  return (
    <div className="map-view">
      {/* Side panel */}
      <div className="map-panel" ref={listRef}>
        <div className="map-panel-header">
          <MapPin size={16} />
          <span>
            {loading ? 'Updating…' : `${count} professional${count !== 1 ? 's' : ''} in this area`}
          </span>
        </div>
        {professionals.length === 0 && !loading ? (
          <div className="map-panel-empty">
            <p>No professionals found in this area.</p>
            <p className="text-muted">Try zooming out or changing filters.</p>
          </div>
        ) : (
          professionals.map((pro) => (
            <div
              key={pro.public_id}
              data-id={pro.public_id}
              className={`map-pro-card ${activeId === pro.public_id ? 'map-pro-card--active' : ''}`}
              onClick={() => handleCardClick(pro)}
            >
              <div className="map-pro-card-inner">
                <div className="avatar avatar-sm">
                  {pro.avatar_url
                    ? <img src={pro.avatar_url} alt={pro.display_name} loading="lazy" />
                    : <span>{pro.display_name?.[0]}</span>}
                </div>
                <div className="map-pro-card-info">
                  <strong>{pro.display_name}</strong>
                  {pro.is_verified && <span className="badge badge-success badge-xs"><Sparkles size={10} /> Verified</span>}
                  <p className="text-muted text-sm">{pro.headline}</p>
                  {pro.avg_rating
                    ? <div className="map-pro-rating"><StarRating rating={pro.avg_rating} size={12} /> <span className="text-muted text-sm">({pro.review_count})</span></div>
                    : <span className="text-muted text-sm">No ratings yet</span>}
                  <div className="pro-card-tags" style={{ marginTop: '0.25rem' }}>
                    {pro.services?.slice(0, 2).map((s) => <span key={s.slug} className="tag">{s.name}</span>)}
                  </div>
                </div>
              </div>
              <Link
                to={`/professionals/${pro.public_id}`}
                className="btn btn-sm btn-outline map-pro-view-btn"
                onClick={(e) => e.stopPropagation()}
              >
                View Profile
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Map */}
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
          {professionals.map((pro) => (
            <Marker
              key={pro.public_id}
              position={[parseFloat(pro.latitude), parseFloat(pro.longitude)]}
              icon={makeIcon(activeId === pro.public_id)}
              ref={(ref) => { markerRefs.current[pro.public_id] = ref; }}
              eventHandlers={{ click: () => handleMarkerClick(pro) }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-header">
                    <div className="avatar avatar-sm">
                      {pro.avatar_url
                        ? <img src={pro.avatar_url} alt={pro.display_name} />
                        : <span>{pro.display_name?.[0]}</span>}
                    </div>
                    <div>
                      <strong>{pro.display_name}</strong>
                      <p className="text-muted text-sm">{pro.headline}</p>
                    </div>
                  </div>
                  {pro.avg_rating && (
                    <div className="map-pro-rating">
                      <StarRating rating={pro.avg_rating} size={12} />
                      <span className="text-muted text-sm"> ({pro.review_count})</span>
                    </div>
                  )}
                  <div className="pro-card-tags" style={{ margin: '0.4rem 0' }}>
                    {pro.services?.slice(0, 2).map((s) => <span key={s.slug} className="tag">{s.name}</span>)}
                  </div>
                  <Link to={`/professionals/${pro.public_id}`} className="btn btn-sm btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                    View Profile
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
