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

## Analytics

Two counters, side by side, both on production builds only and both without cookies:

- **Cloudflare Web Analytics**, the beacon whose token is `analytics.cloudflareWebAnalytics` in
  `brand.yml`: page views, referrers, countries and devices. It does not read query strings.
- **Umami**, configured at build time from the environment and left out until both of the first two
  variables are set (nothing changes before that: no script, no CSP change):

  | Variable | What it is |
  | --- | --- |
  | `UMAMI_SCRIPT_URL` | The tracker, e.g. `https://cloud.umami.is/script.js` or `https://<your-umami>/script.js` |
  | `UMAMI_WEBSITE_ID` | The website's id in Umami (public: it ends up in every page) |
  | `UMAMI_HOST_URL` | Optional: where the tracker sends, when that is not its default (the script's origin, or `https://gateway.umami.is` for Umami Cloud) |

  CI reads them from the repository's **variables** (Settings → Secrets and variables → Actions →
  Variables), not secrets; locally, from the environment or a `.env` file (ignored by git).
  `src/umami.mjs` turns them into the script tag (`src/components/Umami.astro`, rendered by
  `src/layouts/Base.astro`) and into the page's CSP (`script-src` and `connect-src` in
  `astro.config.mjs`), so both always agree; a malformed or plain-HTTP URL stops the build. The
  tracker is deferred and draws nothing, so it neither blocks the first paint nor moves the layout,
  and it sends only from `josegarrido.dev` (`data-domains`): a pull request's preview and the
  Lighthouse run load it but count nothing. The privacy policy describes Umami only when it is
  configured.

Umami records each page view with its referrer and its `utm_*` tags on its own. The links Shipcast
publishes carry `utm_source`, `utm_medium`, `utm_campaign` and `utm_content` (Shipcast's
`docs/tracking.md`); the Worker keeps the query string on every redirect it answers (`/`, moved
pages) and serves an article with tags as the article (`worker/index.test.ts`), and the canonical
URL, `og:url` and `hreflang` links are built from the path alone, so a tagged link never becomes a
second URL for search engines.

The site's own events, sent with `umami.track` from `src/components/Umami.astro`:

| Event | When | Data |
| --- | --- | --- |
| `newsletter-signup` | A subscribe form gets Brevo's success (the double opt-in email is on its way); a form posted without JavaScript is not counted | `lang` (`en`, `es`), `form` (`band`, `page`) |
| `github-click` | A click (or middle click) on any link to `github.com` or a subdomain: header, footer, project pages, an article's body | `url`, the link without its query string |
| `scroll-depth` | The reader scrolls past 25, 50, 75 and 100 % of the page, each mark once per page view (a jump sends the marks it skipped); measured at most once a frame | `depth` (`25`, `50`, `75`, `100`) |
| `reading-time` | On an article, when it has been on screen for 15 s, 30 s, 1, 2, 5 and 10 minutes (a hidden tab does not count), each mark once per page view; sent while the reader is still there, since Umami's tracker gets no request out while a page unloads | `seconds` (`15`, `30`, `60`, `120`, `300`, `600`) |

A new event is named in lowercase-kebab and added to this table.
