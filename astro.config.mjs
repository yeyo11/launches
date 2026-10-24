// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served on the owner's domain through GitHub Pages (custom domain set in the repo's Pages settings).
// The canonical URLs that dev.to and the other copies point to are built from `site`: never change it,
// or a published slug, without a redirect.
export default defineConfig({
  site: 'https://josegarrido.dev',
  trailingSlash: 'always',
  // The root only redirects to /en/, and /subscribed/ is where the newsletter's confirmation lands:
  // neither belongs in search results
  integrations: [sitemap({ filter: (page) => page !== 'https://josegarrido.dev/' && !page.endsWith('/subscribed/') })],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
