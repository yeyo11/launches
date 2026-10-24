# Launches

The blog where [José Antonio Garrido](https://github.com/yeyo11)'s projects are announced the day they
ship: **<https://yeyo11.github.io/launches/>**, in English and Spanish.

Every article here is written by [Shipcast](https://github.com/yeyo11/shipcast) from the project's
code when a release is published, and arrives as a pull request. Merging it publishes the article on
this site (the canonical URL) and lets Shipcast send the rest of the launch to each channel: dev.to,
and later Hashnode, X, LinkedIn and the drafts for Show HN and Reddit.

## Layout

```
src/content/posts/<en|es>/<slug>.md   one article per language, linked by translationKey
launches/<project>/<version>/         the other channels' pieces of a launch (format set by Shipcast)
```

The front matter of an article is checked at build time by `src/content.config.ts`.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:4321/launches/
pnpm check      # type-checks the Astro files
pnpm build
```

Node 24.22.1 (`.nvmrc`); pnpm runs the scripts on it whatever Node is on your `PATH`. Every push to
`main` deploys through `.github/workflows/deploy.yml`.
