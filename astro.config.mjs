// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// A project site on GitHub Pages: every URL lives under /launches. The canonical URLs that dev.to
// and Hashnode point to are built from `site` + `base`, so change both together if a domain arrives.
export default defineConfig({
  site: 'https://yeyo11.github.io',
  base: '/launches',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
