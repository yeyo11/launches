# Launches

The blog where [José Antonio Garrido](https://github.com/yeyo11)'s projects are announced the day they
ship: **<https://josegarrido.dev>**, in English and Spanish.

Every article here is written by [Shipcast](https://github.com/yeyo11/shipcast) from the project's
code when a release is published, and arrives as a pull request. Merging it publishes the article on
this site (the canonical URL) and lets Shipcast send the rest of the launch to each channel: dev.to,
and later Hashnode, X, LinkedIn and the drafts for Show HN and Reddit.

## Layout

```
brand.yml                             the brand: name, profiles, languages, tone (read by Shipcast and the site)
src/content/posts/<en|es>/<slug>.md   one article per language, linked by translationKey
launches/<project>/<version>/         the other channels' pieces of a launch (format set by Shipcast)
```

The front matter of an article is checked at build time by `src/content.config.ts`.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:4321/
pnpm check      # type-checks the Astro files and the Worker
pnpm test       # the Worker's language and Markdown negotiation
pnpm build
pnpm preview:worker   # dist/ behind the Worker, as on Cloudflare: http://localhost:8787/
```

Node 24.22.1 (`.nvmrc`); pnpm runs the scripts on it whatever Node is on your `PATH`.

## Deploy

The site runs on **Cloudflare Workers static assets** (`wrangler.jsonc`): `dist/` served from the
edge, with a small Worker (`worker/index.ts`) in front of `/` and the language trees. `/` answers a
302 to `/es/` or `/en/` from the `lang` cookie (set when a reader switches language) or
`Accept-Language`; an article asked for with `Accept: text/markdown` answers its Markdown. Headers
(HSTS, CSP `frame-ancestors`, a year of cache for `/_astro/*`…) come from `src/headers.mjs`; each page
carries its own CSP `<meta>` with the hashes of its inline scripts and styles.

`.github/workflows/deploy.yml`: every push to `main` builds, deploys with `wrangler deploy` and
pings IndexNow with the articles that changed; every pull request uploads a preview version and
comments its URL, and runs the Lighthouse gate. The Cloudflare steps need the repository secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and end with a notice without them.

### Served by Cloudflare since 2026-10-25

GitHub Pages served the site until 2026-10-25. The cutover, for the record:

- The Worker `josegarrido-dev` has `josegarrido.dev` as its custom domain; the apex's A and AAAA
  records pointing at GitHub Pages were removed.
- `www` is a proxied placeholder record (`AAAA 100::`) and a Redirect Rule sends
  `www.josegarrido.dev/*` to `https://josegarrido.dev/…` with a 301.
- The zone's AI bot settings are off (no blocking, no managed robots.txt), so the site's own
  `robots.txt` is the one served and every crawler gets in.
- GitHub Pages is unpublished and its jobs are gone from the workflow.
