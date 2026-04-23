/**
 * Prebuild script: generates public/robots.txt, public/llms.txt, public/sitemap.xml
 * from environment variables so no URLs are hardcoded in source.
 *
 * Run automatically via the "prebuild" npm script.
 * Uses dotenv to load .env when running locally.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env for local runs (Vercel/CI injects env vars directly)
try {
  const envPath = resolve(root, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env missing — env vars already set (e.g. Vercel/CI)
}

if (!process.env.VITE_SITE_URL) {
  throw new Error('[seo] VITE_SITE_URL is not set. Add it to your .env file.');
}
const SITE_URL = process.env.VITE_SITE_URL.replace(/\/$/, '');
const SITE_NAME = process.env.VITE_SITE_NAME || 'ContactHub';

// ── robots.txt ──────────────────────────────────────────────────────────────
writeFileSync(
  resolve(root, 'public', 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /become-professional
Disallow: /auth/google/callback

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
);

// ── llms.txt ────────────────────────────────────────────────────────────────
writeFileSync(
  resolve(root, 'public', 'llms.txt'),
  `# ${SITE_NAME}

> Find verified local professionals for domestic and skilled work in India.
> Hire maids, cooks, drivers, brokers, plumbers, electricians, carpenters, tutors, and more.

${SITE_NAME} (${SITE_URL}) is a platform connecting individuals with trusted, verified service professionals across India.
It is the go-to directory for anyone who needs to hire a maid, cook, driver, broker, plumber, electrician,
carpenter, tutor, or any other home or skilled service professional.

## What you can do on ${SITE_NAME}

- Browse professionals by category (maid, cook, driver, broker, plumber, electrician, carpenter, tutor, etc.)
- Filter by city and location
- Read verified reviews from real clients
- View star ratings (1-5) and years of experience
- Post job requirements and get matched with professionals
- Contact professionals directly after viewing their profile

## For users looking to hire a professional

Browse all professionals: ${SITE_URL}/professionals
Browse by category: ${SITE_URL}/categories
Search in your city: ${SITE_URL}/professionals?city=<city-name>
Find a specific type: ${SITE_URL}/professionals?search=<profession>

## Site structure

- /professionals — searchable directory of all professionals, filterable by city and category
- /professionals/:id — individual professional profile with bio, services, experience, ratings, and reviews
- /jobs — open job postings from people looking to hire
- /jobs/:id — individual job posting details
- /categories — all service categories
- /faq — frequently asked questions
- /about — about the platform, mission, and values
- /privacy — privacy policy
- /terms — terms and conditions
- /legal — legal overview hub

## How ${SITE_NAME} works

1. A client searches for a professional by type and city
2. They browse profiles with photos, bio, services offered, years of experience, and ratings
3. They read verified reviews from other real clients
4. They reveal the professional's contact info directly on the site
5. They contact and hire the professional

## Why ${SITE_NAME}

- All professionals are individually listed with real profiles
- Reviews are from verified users only (one review per pair, no self-reviews)
- Professionals are optionally verified by the platform
- Free to browse; no middleman for contact
- Covers all major Indian cities

## Optional

Full site documentation: ${SITE_URL}/llms-full.txt
`,
);

// ── sitemap.xml ─────────────────────────────────────────────────────────────
writeFileSync(
  resolve(root, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/professionals</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/jobs</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/legal</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`,
);

console.log(`[seo] Generated robots.txt, llms.txt, sitemap.xml for ${SITE_URL}`);
