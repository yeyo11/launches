// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { codeColours } from './src/code-colours.mjs';
import { sitemapDetails } from './src/sitemap.mjs';

const site = 'https://josegarrido.dev';
const details = sitemapDetails(site);

// Served on the owner's domain through GitHub Pages (custom domain set in the repo's Pages settings).
// The canonical URLs that dev.to and the other copies point to are built from `site`: never change it,
// or a published slug, without a redirect.
export default defineConfig({
  site,
  trailingSlash: 'always',
  // The root only picks a language, /subscribed/ is where the newsletter's confirmation lands and
  // /es/privacy/ is a redirect: none belongs in search results
  integrations: [
    sitemap({
      filter: (page) => page !== `${site}/` && page !== `${site}/es/privacy/` && !/\/(subscribed|suscrito)\/$/.test(page),
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
  // Each page carries its own CSS: no stylesheet blocks the first paint, and the site is small
  build: { inlineStylesheets: 'always' },
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false, transformers: [codeColours()] } },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
