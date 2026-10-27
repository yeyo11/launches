// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { codeColours } from './src/code-colours.mjs';
import { articleImages } from './src/article-images.mjs';
import { FILTERED_INDEX, sitemapDetails } from './src/sitemap.mjs';
import { headersFile } from './src/headers.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const site = 'https://josegarrido.dev';
const details = sitemapDetails(site);

// The newsletter's forms post to Brevo (their URLs are in brand.yml): the page may send to that host
const brand = parse(readFileSync(new URL('./brand.yml', import.meta.url), 'utf8'));
const formHosts = [...new Set(Object.values(brand.newsletter?.forms ?? {}).map((url) => new URL(String(url)).origin))].join(' ');

/** Writes dist/_headers from src/headers.mjs, the list the Worker applies too
 * @type {import('astro').AstroIntegration} */
const cloudflareHeaders = {
  name: 'cloudflare-headers',
  hooks: {
    'astro:build:done': ({ dir }) => writeFileSync(new URL('_headers', dir), headersFile()),
  },
};

// Served on the owner's domain by Cloudflare Workers static assets (wrangler.jsonc); GitHub Pages until
// the cutover in README.md.
// The canonical URLs that dev.to and the other copies point to are built from `site`: never change it,
// or a published slug, without a redirect.
export default defineConfig({
  site,
  trailingSlash: 'always',
  // The root only picks a language, /subscribed/ is where the newsletter's confirmation lands and
  // /es/privacy/ is a redirect, and a filtered article index repeats the full one: none belongs in
  // search results
  integrations: [
    cloudflareHeaders,
    sitemap({
      filter: (page) => page !== `${site}/` && page !== `${site}/es/privacy/` && !/\/(subscribed|suscrito)\/$/.test(page) && !FILTERED_INDEX.test(page),
      serialize: (item) => {
        const known = details.get(item.url);
        return known ? { ...item, ...(known.lastmod && { lastmod: known.lastmod }), ...(known.links.length > 0 && { links: known.links }) } : item;
      },
    }),
  ],
  // The Spanish privacy policy was published at /es/privacy/ before paths were translated
  redirects: { '/es/privacy/': '/es/privacidad/' },
  // Both code themes ship as CSS variables and follow the page's theme; codeColours() lifts the few
  // colours that fail AA on the code background (checked by scripts/contrast.mjs)
  // Each page gets a Content-Security-Policy <meta> with the hashes of its own inline scripts and
  // styles, so neither needs 'unsafe-inline'. Inline style *attributes* (each project's colour, Shiki's
  // code colours) are allowed through style-src-attr only. The beacon is Cloudflare Web Analytics.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        // Vite inlines the smallest font subsets into the CSS as data: URLs
        "font-src 'self' data:",
        "media-src 'self'",
        "manifest-src 'self'",
        `connect-src 'self' https://cloudflareinsights.com ${formHosts}`,
        `form-action 'self' ${formHosts}`,
        "base-uri 'self'",
        "object-src 'none'",
        // Left out only for a build previewed over plain HTTP on another machine (PREVIEW_HTTP=1, e.g.
        // across a Tailscale address), where it would send every image and font to an https:// that
        // does not answer; localhost is exempt from it anyway
        ...(process.env.PREVIEW_HTTP === '1' ? [] : /** @type {const} */ (['upgrade-insecure-requests'])),
      ],
      scriptDirective: { resources: ["'self'", 'https://static.cloudflareinsights.com'] },
      styleDirective: { resources: [{ resource: "'self'", kind: 'element' }, { resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
  // Each page carries its own CSS: no stylesheet blocks the first paint, and the site is small
  build: { inlineStylesheets: 'always' },
  // articleImages defers an article's images and gives them their size (src/article-images.mjs)
  markdown: { processor: satteri({ hastPlugins: [articleImages] }), shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false, transformers: [codeColours()] } },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
