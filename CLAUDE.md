# Launches

José Antonio Garrido's launch blog (Astro 7, static, GitHub Pages under `/launches`), written by
[Shipcast](https://github.com/yeyo11/shipcast). The design, decisions and schemas live in Shipcast's
repo; this one holds the content and the site. Astro's own guidance for agents is in
[AGENTS.md](AGENTS.md).

- **Content arrives by pull request.** Shipcast opens one per launch; merging it publishes. Do not
  write articles here by hand unless asked.
- **Articles:** `src/content/posts/<en|es>/<slug>.md`, front matter validated by
  `src/content.config.ts`. The English and Spanish versions share a `translationKey`.
- **Canonical URLs** are `https://yeyo11.github.io/launches/<lang>/<slug>/`, and dev.to and Hashnode
  copies point to them: never change `site`, `base` or a published slug without a redirect.
- **Look:** Shipcast's day theme (`shipcast/docs/plans/design-system.md`): Saira for display,
  Atkinson Hyperlegible Next for text, tokens in `src/styles/global.css`, no gradients, contrast AA.
- **Checks:** `pnpm check` and `pnpm build` must pass; every push to `main` deploys.
- Everything technical in English; the articles exist in both languages.
