import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from '../config/site';
import { Users, ShieldCheck, Star, Zap } from 'lucide-react';

const VALUES = [
  {
    icon: <ShieldCheck size={28} />,
    title: 'Trust & Verification',
    desc: 'Every professional goes through a manual verification process so you always hire with confidence.',
  },
  {
    icon: <Users size={28} />,
    title: 'Community First',
    desc: 'We built ContactHub to empower local professionals and connect them directly with people who need them — no middleman, no commission.',
  },
  {
    icon: <Star size={28} />,
    title: 'Honest Reviews',
    desc: 'Only real clients can leave reviews — one per hiring pair. Ratings reflect genuine experiences, not paid promotions.',
  },
  {
    icon: <Zap size={28} />,
    title: 'Direct Contact',
    desc: 'No chat bots, no lead forms. Reveal the professional\'s number and call them directly — faster and more personal.',
  },
];

export default function About() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <Helmet>
        <title>{`About Us | ${SITE_NAME}`}</title>
        <meta name="description" content={`Learn about ${SITE_NAME} — our mission to connect people with trusted local professionals across India without brokers or commissions.`} />
        <link rel="canonical" href={`${SITE_URL}/about`} />
      </Helmet>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="page-title">About {SITE_NAME}</h1>
        <p className="page-subtitle">Connecting people with trusted local professionals — no brokers, no commissions.</p>

        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Our Story</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Finding a reliable plumber, electrician, or house help in India has always been a word-of-mouth exercise.
            You ask a neighbour, post in a WhatsApp group, and hope for the best. We built {SITE_NAME} to change that.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {SITE_NAME} is a marketplace where skilled professionals — plumbers, electricians, carpenters, maids, cooks,
            tutors, and more — list their services with real profiles, verifiable credentials, and honest client reviews.
            Clients browse, compare, and contact them directly. No middleman. No markup.
          </p>
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {VALUES.map((v) => (
              <div key={v.title} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{v.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Where We Operate</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            We currently focus on Bangalore, with plans to expand to other major Indian cities.
            If you're a professional outside Bangalore and want to be listed, <Link to="/register">create an account</Link> and
            set up your profile — we're growing fast.
          </p>
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Get In Touch</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Have feedback, a partnership enquiry, or just want to say hello?
            Use the <strong>Contact & Feedback</strong> button in the footer — we read every message.
          </p>
        </section>
      </div>
    </div>
  );
}
