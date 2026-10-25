# Launches

José Antonio Garrido's launch blog (Astro 7, static, Cloudflare Workers static assets on
`josegarrido.dev`, GitHub Pages until the cutover in the README), written by
[Shipcast](https://github.com/yeyo11/shipcast). The design, decisions and schemas live in Shipcast's
repo; this one holds the content and the site. Astro's own guidance for agents is in
[AGENTS.md](AGENTS.md).

- **Content arrives by pull request.** Shipcast opens one per launch; merging it publishes. Do not
  write articles here by hand unless asked.
- **Articles:** `src/content/posts/<en|es>/<slug>.md`, front matter validated by
  `src/content.config.ts`. The English and Spanish versions share a `translationKey`.
- **`brand.yml`** describes the brand (name, profiles, languages, tone) for Shipcast and for the site,
  which reads it in `src/site.ts`. Public information only, never tokens.
- **Canonical URLs** are `https://josegarrido.dev/<lang>/<slug>/`, and the dev.to copies point to
  them: never change `site` or a published slug without a redirect.
- **Look:** the author's personal identity, distinct from the brands of the tools announced here:
  an editorial magazine on pure black, Fraunces headlines with each word's initial in its wonky
  italic (`Headline.astro`), Instrument Sans for the interface, and one flat colour per project
  (`src/projects.ts`) on its house illustration (`Illo.astro`) and behind its headline. Dark by
  default, AA contrast in both themes (`node scripts/contrast.mjs`).
- **Checks:** `pnpm check`, `pnpm test` and `pnpm build` must pass; every push to `main` deploys, and
  every pull request gets a Cloudflare preview URL and a Lighthouse gate (`lighthouserc.json`).
- **Serving:** `wrangler.jsonc` and `worker/index.ts` (the language of `/`, Markdown for
  `Accept: text/markdown`, redirects); headers in `src/headers.mjs`, the per-page CSP in
  `astro.config.mjs` (`security.csp`). A new inline script or third-party host needs a CSP change.
- **AI readiness:** `/llms.txt`, `/llms-full.txt` and `/<lang>/<slug>.md` are built from the articles;
  `robots.txt` allows every crawler. Covers stay in `public/` (Shipcast's contract) and are imported
  at build time through `src/images.ts` for responsive AVIF/WebP.
- Everything technical in English; the articles exist in both languages.
