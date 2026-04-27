import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

function initGtag(measurementId) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // send_page_view: false — we fire page_view manually on each navigation
  window.gtag('config', measurementId, { send_page_view: false });
}

export default function Analytics() {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (!GA_ID) return;

    if (!initialized.current) {
      initGtag(GA_ID);
      initialized.current = true;
    }

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}
