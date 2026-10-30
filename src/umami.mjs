// Umami analytics, next to Cloudflare Web Analytics: configured at build time from the environment
// (UMAMI_SCRIPT_URL and UMAMI_WEBSITE_ID, and UMAMI_HOST_URL when the collector is not the script's
// origin), and left out entirely while either of the first two is unset. Read by astro.config.mjs
// for the page's CSP and by src/layouts/Base.astro for the script tag, so both always agree.
// The events the site sends are in README.md (Analytics).

// Umami Cloud's tracker is served from cloud.umami.is but sends to this host unless told otherwise
const CLOUD_SCRIPT_HOST = 'cloud.umami.is';
const CLOUD_COLLECTOR = 'https://gateway.umami.is';

/**
 * @typedef {object} Umami
 * @property {string} src The tracker's URL
 * @property {string} websiteId The website's id in Umami
 * @property {string | undefined} hostUrl Where the tracker sends, when not its default
 * @property {string} scriptOrigin For the CSP's script-src
 * @property {string} connectOrigin For the CSP's connect-src: where the tracker sends
 */

/**
 * The Umami configuration in `env`, or undefined when it is not configured. A malformed URL stops
 * the build rather than shipping a tracker that cannot load.
 * @param {Record<string, string | boolean | undefined>} env
 * @returns {Umami | undefined}
 */
export function umamiConfig(env) {
  const src = String(env.UMAMI_SCRIPT_URL ?? '').trim();
  const websiteId = String(env.UMAMI_WEBSITE_ID ?? '').trim();
  if (!src || !websiteId) return undefined;
  const script = httpsUrl(src, 'UMAMI_SCRIPT_URL');
  const host = String(env.UMAMI_HOST_URL ?? '').trim();
  const hostUrl = host ? httpsUrl(host, 'UMAMI_HOST_URL').origin : undefined;
  const connectOrigin = hostUrl ?? (script.hostname === CLOUD_SCRIPT_HOST ? CLOUD_COLLECTOR : script.origin);
  return { src: script.href, websiteId, hostUrl, scriptOrigin: script.origin, connectOrigin };
}

/** @param {string} value @param {string} name */
function httpsUrl(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not a URL: ${value}`);
  }
  // The site upgrades every request to HTTPS (upgrade-insecure-requests); localhost is exempt
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error(`${name} must be an https:// URL: ${value}`);
  return url;
}
