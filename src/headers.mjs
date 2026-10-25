// The HTTP headers the site is served with on Cloudflare, in one place for both ways a response
// leaves: dist/_headers (written from this list after the build, see astro.config.mjs) for what the
// assets serve directly, and worker/index.ts for the responses that pass through the Worker, which
// Cloudflare does not apply _headers to.
//
// The page's own Content-Security-Policy (scripts, styles, connections, forms) is a <meta> element
// Astro writes into each page with the hashes of its inline scripts and styles (security.csp in
// astro.config.mjs); the header below adds what a <meta> cannot carry (frame-ancestors). Browsers
// enforce both, so the result is their intersection.

/** On every response */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  'X-Frame-Options': 'DENY',
};

// Pages, feeds and anything not listed keep Cloudflare's default, `public, max-age=0, must-revalidate`
// with an ETag: a browser revalidates on every visit, so a published article shows up at once.

/** Astro names these files by their content hash: a new version is a new URL */
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

/** The rules of dist/_headers, as [path pattern, headers] */
export const HEADER_RULES = [
  ['/*', SECURITY_HEADERS],
  ['/_astro/*', { 'Cache-Control': IMMUTABLE_CACHE }],
  // Not hashed, but Shipcast writes a launch's media under its version: a day at most is safe
  ['/launches/*', { 'Cache-Control': 'public, max-age=86400' }],
  ['/covers/*', { 'Cache-Control': 'public, max-age=86400' }],
  ['/articles/*', { 'Cache-Control': 'public, max-age=86400' }],
];

/** The text of a _headers file. No two rules set the same header, since Cloudflare joins them. */
export function headersFile() {
  return HEADER_RULES.map(([path, headers]) => `${path}\n${Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`).join('\n')}`).join('\n\n') + '\n';
}
