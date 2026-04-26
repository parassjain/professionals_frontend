import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FALLBACK = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM = 13;

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  const prevTarget = useRef(null);
  useEffect(() => {
    if (target && target !== prevTarget.current) {
      prevTarget.current = target;
      map.flyTo([target.lat, target.lng], DEFAULT_ZOOM, { duration: 1 });
    }
  }, [target, map]);
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'User-Agent': 'ContactHub/1.0' } }
    );
    const data = await res.json();
    const addr = data.address;
    return addr.city || addr.town || addr.village || addr.county || addr.state || '';
  } catch {
    return '';
  }
}

export default function LocationPicker({ value, onChange, flyTo }) {
  const mapRef = useRef(null);
  const [city, setCity] = useState('');
  const prevLoc = useRef(null);

  useEffect(() => {
    const locKey = value ? `${value.lat},${value.lng}` : null;
    if (locKey && locKey !== prevLoc.current) {
      prevLoc.current = locKey;
      setCity('');
      reverseGeocode(value.lat, value.lng).then((c) => {
        if (c) {
          setCity(c);
          onChange({ lat: value.lat, lng: value.lng, city: c });
        }
      });
    }
  }, [value?.lat, value?.lng, onChange]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(loc);
        mapRef.current?.flyTo([loc.lat, loc.lng], DEFAULT_ZOOM, { duration: 1 });
      },
      () => {},
      { timeout: 5000 },
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '280px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer
          center={[FALLBACK.lat, FALLBACK.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {flyTo && <FlyTo target={flyTo} />}
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const ll = e.target.getLatLng();
                  const locKey = `${ll.lat},${ll.lng}`;
                  if (locKey !== prevLoc.current) {
                    prevLoc.current = locKey;
                    setCity('');
                    reverseGeocode(ll.lat, ll.lng).then((c) => {
                      if (c) {
                        setCity(c);
                        onChange({ lat: ll.lat, lng: ll.lng, city: c });
                      } else {
                        onChange({ lat: ll.lat, lng: ll.lng });
                      }
                    });
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        <span className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={13} />
          {value
            ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}${city ? ` — ${city}` : ''}`
            : 'Click on the map to set job location'}
        </span>
        <button type="button" className="btn btn-sm btn-outline" onClick={handleLocate} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Navigation size={13} /> Use my location
        </button>
      </div>
    </div>
  );
}
