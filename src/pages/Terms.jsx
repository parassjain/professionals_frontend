import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from '../config/site';

const LAST_UPDATED = 'April 24, 2025';

export default function Terms() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <Helmet>
        <title>{`Terms and Conditions | ${SITE_NAME}`}</title>
        <meta name="description" content={`Read the ${SITE_NAME} Terms and Conditions governing your use of our professional services marketplace.`} />
        <link rel="canonical" href={`${SITE_URL}/terms`} />
      </Helmet>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 className="page-title">Terms and Conditions</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Last updated: {LAST_UPDATED}</p>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          By accessing or using {SITE_NAME} ({SITE_URL}), you agree to be bound by these Terms and Conditions.
          If you do not agree, please do not use the platform.
        </p>

        {[
          {
            title: '1. About the Platform',
            body: (
              <p>{SITE_NAME} is an online directory that connects individuals ("Clients") with independent service professionals ("Professionals"). We are a platform — we do not employ, endorse, or guarantee the work of any professional listed on the site.</p>
            ),
          },
          {
            title: '2. Eligibility',
            body: (
              <p>You must be at least 18 years old and capable of forming a legally binding contract to use {SITE_NAME}. By registering, you confirm that you meet these requirements.</p>
            ),
          },
          {
            title: '3. Accounts',
            body: (
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must provide accurate and up-to-date information when registering.</li>
                <li>One person may hold only one account. Multiple accounts for the same individual may be removed.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
              </ul>
            ),
          },
          {
            title: '4. Professional Listings',
            body: (
              <>
                <p>Professionals who create profiles on {SITE_NAME}:</p>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                  <li>Must provide accurate information about their skills, experience, and services.</li>
                  <li>Are independent contractors, not employees of {SITE_NAME}.</li>
                  <li>Are solely responsible for the quality of services they deliver.</li>
                  <li>Grant {SITE_NAME} a non-exclusive, royalty-free licence to display their profile content on the platform.</li>
                </ul>
              </>
            ),
          },
          {
            title: '5. Contact Reveals',
            body: (
              <p>Registered Clients may reveal a Professional's contact details (phone/email) subject to a daily reveal limit. This information is provided solely for the purpose of hiring the Professional and must not be used for spam, harassment, or unsolicited marketing.</p>
            ),
          },
          {
            title: '6. Reviews',
            body: (
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li>Reviews must be honest, first-hand accounts of your experience.</li>
                <li>You may not review yourself or post fake, incentivised, or defamatory reviews.</li>
                <li>We reserve the right to remove reviews that violate these rules.</li>
              </ul>
            ),
          },
          {
            title: '7. Prohibited Conduct',
            body: (
              <ul style={{ paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li>Posting false, misleading, or fraudulent information.</li>
                <li>Scraping, crawling, or bulk-downloading data without permission.</li>
                <li>Attempting to gain unauthorised access to any account or system.</li>
                <li>Using the platform for spam, phishing, or any illegal activity.</li>
                <li>Circumventing or disabling any security or rate-limiting feature.</li>
              </ul>
            ),
          },
          {
            title: '8. Intellectual Property',
            body: (
              <p>All platform code, design, branding, and original content are the property of {SITE_NAME}. User-generated content (profile text, photos, reviews) remains the property of its creator, but you grant us a licence to display it on the platform.</p>
            ),
          },
          {
            title: '9. Disclaimers',
            body: (
              <p>{SITE_NAME} is provided "as is" without warranties of any kind. We do not guarantee the accuracy of professional listings, the quality of services rendered, or the availability of the platform at any given time. Any engagement between a Client and a Professional is a direct arrangement between those parties.</p>
            ),
          },
          {
            title: '10. Limitation of Liability',
            body: (
              <p>To the maximum extent permitted by law, {SITE_NAME} and its founders shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including disputes between Clients and Professionals.</p>
            ),
          },
          {
            title: '11. Termination',
            body: (
              <p>We may suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time by contacting us. Termination does not affect accrued rights or obligations.</p>
            ),
          },
          {
            title: '12. Governing Law',
            body: (
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
            ),
          },
          {
            title: '13. Changes to These Terms',
            body: (
              <p>We may revise these Terms from time to time. Continued use of the platform after changes take effect constitutes your acceptance of the revised Terms.</p>
            ),
          },
          {
            title: '14. Contact',
            body: (
              <p>Questions about these Terms? Use the <strong>Contact & Feedback</strong> button in the footer or visit our <Link to="/about">About page</Link>.</p>
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
