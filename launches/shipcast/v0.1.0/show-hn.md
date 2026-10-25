# Show HN

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

Title: Show HN: Shipcast – launch GitHub projects from the code, not the README

URL to submit: https://github.com/yeyo11/shipcast

First comment, to post right after submitting:

Hi HN. I'm a solo developer and I kept losing an afternoon to the same release announcement: blog post, dev.to copy, Bluesky, Mastodon, Instagram, newsletter, Show HN. Shipcast does it from the release.

How it works: a .github/launch.yml in the repo turns launches on and sets a mode per channel (auto, approval, manual or off). The engine polls your public GitHub events (no webhooks) or you run `pnpm shipcast launch owner/repo`. A pre-flight check confirms there is a release, a valid launch.yml, a license, a README and a demo. Then Claude, through my claudio project (Claude Code as a service), reads the repository and separates what is implemented from what is only planned or claimed by the docs. The result is one structured content pack validated against a JSON Schema. The drafts arrive as a pull request in a launches repo that is also the blog's source; merging publishes. A SQLite registry makes sure each channel is published once.

Today it publishes to a blog (en/es), dev.to, Bluesky, Mastodon, Instagram (carousel, story, comment) and a Brevo newsletter, with Hashnode, Telegram and Discord connectors built. Show HN and Product Hunt are drafts only. There is a CLI and a web app, with secrets in the OS keychain.

It is alpha, built for my own use, and it launched claudio v0.9.0. It needs Node 24, a claudio instance and a launches repo with an Astro blog, so setup is not trivial yet. Next: other AI providers, a GitHub Action mode and a one-command install.

MIT, TypeScript. Feedback welcome.
