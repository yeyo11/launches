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

### Cutover from GitHub Pages

GitHub Pages keeps serving `josegarrido.dev` until these steps, done by the maintainer:

1. An API token (My Profile › API Tokens › Create custom token) with Account › Workers Scripts: Edit,
   Account › Account Settings: Read, Zone › Workers Routes: Edit and Zone › Zone: Read (zone
   `josegarrido.dev`); add it and the account id as the repository secrets `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID`.
2. Merge to `main` (or run the workflow by hand): `wrangler deploy` publishes the Worker
   `josegarrido-dev`; check it at its `workers.dev` URL.
3. Workers & Pages › josegarrido-dev › Settings › Domains & Routes › Add › Custom domain:
   `josegarrido.dev`. Cloudflare replaces the apex's DNS records pointing at GitHub Pages with the
   Worker's; remove any that remain.
4. Security › Bots (zone): turn off "Block AI bots" and AI Labyrinth, and the managed robots.txt
   (AI Crawl Control), so the site's own `robots.txt` is the one served and every crawler gets in.
5. Rules › Redirect Rules: `www.josegarrido.dev/*` → `https://josegarrido.dev/${1}`, 301, with a
   proxied DNS record for `www` (GitHub Pages did this redirect before).
6. In this repository: set the variable `GITHUB_PAGES` to `off`, unpublish GitHub Pages in Settings ›
   Pages, and later delete the `pages-*` jobs from the workflow.
