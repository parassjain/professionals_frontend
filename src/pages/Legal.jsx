import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from '../config/site';
import { FileText, ShieldCheck, Info } from 'lucide-react';

const DOCS = [
  {
    icon: <Info size={24} />,
    title: 'About Us',
    desc: 'Learn about our mission, values, and how ContactHub works.',
    to: '/about',
    link: 'Read About Us',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Privacy Policy',
    desc: 'Understand what data we collect, how we use it, and your rights.',
    to: '/privacy',
    link: 'Read Privacy Policy',
  },
  {
    icon: <FileText size={24} />,
    title: 'Terms and Conditions',
    desc: 'The rules and agreements governing your use of the platform.',
    to: '/terms',
    link: 'Read Terms',
  },
];

export default function Legal() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <Helmet>
        <title>{`Legal | ${SITE_NAME}`}</title>
        <meta name="description" content={`Legal documents for ${SITE_NAME} — Privacy Policy, Terms and Conditions, and more.`} />
        <link rel="canonical" href={`${SITE_URL}/legal`} />
      </Helmet>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="page-title">Legal</h1>
        <p className="page-subtitle">Our policies and agreements in one place.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
          {DOCS.map((doc) => (
            <div key={doc.to} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }}>{doc.icon}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.3rem' }}>{doc.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{doc.desc}</p>
                <Link to={doc.to} className="btn btn-sm btn-outline">{doc.link} →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
