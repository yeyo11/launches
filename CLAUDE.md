# Launches

José Antonio Garrido's launch blog (Astro 7, static, GitHub Pages on `josegarrido.dev`), written by
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
- **Look:** the author's personal identity, distinct from the brands of the tools announced here.
  The current blackboard design (green slate, chalk, yellow accent) was rejected by the owner on
  2026-10-24 and is being replaced; dark by default, AA contrast in both themes.
- **Checks:** `pnpm check` and `pnpm build` must pass; every push to `main` deploys.
- Everything technical in English; the articles exist in both languages.
