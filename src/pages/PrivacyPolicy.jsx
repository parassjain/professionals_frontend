import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME } from '../config/site';

const LAST_UPDATED = 'April 24, 2025';

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <Helmet>
        <title>{`Privacy Policy | ${SITE_NAME}`}</title>
        <meta name="description" content={`Read the ${SITE_NAME} Privacy Policy to understand how we collect, use, and protect your personal data.`} />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Helmet>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Last updated: {LAST_UPDATED}</p>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          {SITE_NAME} ("we", "our", or "us") operates {SITE_URL}. This policy explains what personal data we collect,
          how we use it, and your rights over it.
        </p>

        {[
          {
            title: '1. Information We Collect',
            body: (
              <>
                <p><strong>Account data:</strong> When you register, we collect your name, email address, phone number, city, and password hash.</p>
                <p><strong>Professional profile data:</strong> If you create a professional profile, we also collect your headline, bio, years of experience, address, and optionally your GPS coordinates (latitude / longitude) for map display.</p>
                <p><strong>Usage data:</strong> We log request metadata (IP address, browser user-agent, pages visited) for security monitoring and analytics via OpenTelemetry.</p>
                <p><strong>Communications:</strong> If you submit feedback or contact us, we store the message content and your contact details.</p>
              </>
            ),
          },
          {
            title: '2. How We Use Your Information',
            body: (
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li>To provide, maintain, and improve the platform</li>
                <li>To authenticate you and keep your account secure</li>
                <li>To display your public professional profile to other users</li>
                <li>To show your location on the map (only if you provide coordinates)</li>
                <li>To respond to feedback and support requests</li>
                <li>To send transactional emails (e.g., email verification)</li>
                <li>To detect and prevent fraud or abuse</li>
              </ul>
            ),
          },
          {
            title: '3. Data Sharing',
            body: (
              <p>We do not sell your personal data. We share data only with infrastructure providers needed to operate the service (Supabase for database hosting, Cloudinary for image storage, Vercel for deployment, Grafana for monitoring). These providers are bound by their own privacy policies and data processing agreements.</p>
            ),
          },
          {
            title: '4. Public Profile Data',
            body: (
              <p>If you create a professional profile, your name, headline, bio, services, ratings, reviews, and profile photo are visible to all visitors. Your exact email and phone number are <strong>masked</strong> by default and only revealed to logged-in users who explicitly request them (subject to a daily limit).</p>
            ),
          },
          {
            title: '5. Cookies & Local Storage',
            body: (
              <p>We store your authentication tokens (JWT access and refresh tokens) in <code>localStorage</code> to keep you logged in. We do not use third-party advertising cookies. OpenStreetMap tiles used in the map view are loaded from OpenStreetMap servers, which may set their own cookies.</p>
            ),
          },
          {
            title: '6. Data Retention',
            body: (
              <p>We retain your account data for as long as your account is active. If you request deletion, we will remove your personal data within 30 days, except where we are required to retain it for legal obligations.</p>
            ),
          },
          {
            title: '7. Your Rights',
            body: (
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Update inaccurate data via your profile settings.</li>
                <li><strong>Deletion:</strong> Request account and data deletion by contacting us.</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              </ul>
            ),
          },
          {
            title: '8. Security',
            body: (
              <p>We use HTTPS for all data in transit, hashed passwords (Django's PBKDF2), JWT-based authentication with short-lived access tokens, and role-based access controls. No security measure is perfect — please use a strong, unique password.</p>
            ),
          },
          {
            title: '9. Children',
            body: (
              <p>{SITE_NAME} is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has submitted data, contact us and we will delete it promptly.</p>
            ),
          },
          {
            title: '10. Changes to This Policy',
            body: (
              <p>We may update this policy from time to time. We will update the "Last updated" date at the top and, for material changes, notify users by email or a prominent notice on the site.</p>
            ),
          },
          {
            title: '11. Contact',
            body: (
              <p>Questions about this policy? Use the <strong>Contact & Feedback</strong> button in the footer.</p>
            ),
          },
        ].map((section) => (
          <section key={section.title} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{section.title}</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
