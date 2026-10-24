// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served on the owner's domain through GitHub Pages (custom domain set in the repo's Pages settings).
// The canonical URLs that dev.to and the other copies point to are built from `site`: never change it,
// or a published slug, without a redirect.
export default defineConfig({
  site: 'https://josegarrido.dev',
  trailingSlash: 'always',
  // The root only redirects to /en/, so it stays out of the sitemap
  integrations: [sitemap({ filter: (page) => page !== 'https://josegarrido.dev/' })],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
