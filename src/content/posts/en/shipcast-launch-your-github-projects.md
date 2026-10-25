---
title: "Shipcast: launch your GitHub projects without writing the announcement ten times"
description: "Shipcast reads your repo's code on each release, writes a piece for every channel and publishes each one once you approve it. Here is how it works and how to run it."
pubDate: 2026-10-25
lang: en
translationKey: "shipcast-launch-your-github-projects"
repo: "https://github.com/yeyo11/shipcast"
version: "v0.1.0"
tags: ["github", "automation", "ai", "opensource"]
image: "/launches/shipcast/v0.1.0/og.png"
---

You publish a release and then spend an afternoon on the same announcement: a blog post, a dev.to copy, a Bluesky post, a Mastodon post, an Instagram carousel, a newsletter issue, a Show HN title. Each one has its own length limit and its own tone, and the easiest mistake is to promise in one of them something the code does not do yet.

Shipcast does that work from the release. It reads the project's **code**, not just its README, writes a piece for each channel, and publishes each one once you approve it. I used it to launch [claudio](https://github.com/yeyo11/claudio) v0.9.0, and this article is part of its own launch.

## What you get

- The article on your blog in English and Spanish, each with its own URL.
- Canonical copies on dev.to (and Hashnode, built but not yet tested live).
- Posts on Bluesky and Mastodon, and an Instagram carousel with its story and a comment.
- A newsletter issue per language through Brevo.
- Ready-to-paste Show HN and Product Hunt drafts: neither has an API to post through, so Shipcast never posts them.
- Telegram and Discord connectors, plus the numbers of each channel on the launch's page.

## Opt in per repo

A project turns launches on with `.github/launch.yml`. Each channel has a mode:

```yaml
enabled: true
brand: personal
language: en

publishing:
  blog: approval
  devto: approval
  bluesky: approval
  hackerNews: manual

assets:
  demo: docs/media/tour.gif
```

`auto` publishes as soon as the pack is generated, `approval` publishes when you merge the drafts, `manual` leaves a draft you post yourself, and `off` skips the channel. Hacker News and Product Hunt refuse any mode other than `manual` or `off`. The schema is strict: a misspelt key is an error that points at its line instead of a setting silently ignored.

## Check the repo first

Before spending any AI budget, the pre-flight check confirms the repo is ready:

```bash
pnpm shipcast preflight owner/repo
```

It checks that there is a published release, a valid and enabled `launch.yml`, a license GitHub recognises, a README and a demo that answers. Each line prints `ok`, `warn` or `FAIL`, and `launch` refuses to start while a required check fails.

## Trigger a launch

Two ways. Manually, for the latest release or a given tag:

```bash
pnpm shipcast launch owner/repo --ref v1.2.0
```

Or let the engine watch your account:

```bash
pnpm shipcast watch --interval 300
```

`watch` polls your public GitHub events (there are no webhooks, so nothing on your machine is exposed), drafts each new release, publishes it once its pull request is merged and reads the metrics every six hours. The interval cannot go below 60 seconds, which is what GitHub asks of event pollers.

## How it works

1. **Analyse.** Claude, through [claudio](https://github.com/yeyo11/claudio), reads the repository and separates what is implemented from what is only planned or only claimed by the docs. Only the implemented part is presented as working.
2. **Generate.** The result is one structured content pack validated against a JSON Schema: the article in each language and a piece for each channel within its limits. Shipcast also builds the launch image, the Instagram carousel and story, and a cover in your blog's style when the project has none.
3. **Approve.** The drafts arrive as a pull request in your launches repo, which is also your blog's source. Read and edit them in the app or on GitHub; merging publishes.
4. **Publish once.** A SQLite registry records every launch and every channel. Re-running a workflow or publishing a minor version does not repeat a campaign, and a channel that failed for good can be retried:

```bash
pnpm shipcast publish --retry bluesky
```

`pnpm shipcast status` lists the latest launches, where each stands and which channels are configured.

## The app

```bash
pnpm app
```

The web app has Launches (where each one went and what is waiting for you), a review page (edit, approve, retry), Launch a repo, Write, and Channels. Write takes an article in your own words, translates it, writes the piece for each channel and publishes it the same way. Channels lists every network with its accounts per brand, checks each credential, runs OAuth for Mastodon and Instagram and keeps secrets in your operating system's keychain. Sign-in is with GitHub, limited to the logins you allow.

The personal and company brands have their own accounts, tone and language, and a launch only uses its own brand's accounts.

## Quick start

You need Node 24 and pnpm, [claudio](https://github.com/yeyo11/claudio) as the AI provider (the repo's `docker-compose.yml` starts it), a launches repo with an Astro blog that accepts the articles ([docs/launches-repo.md](https://github.com/yeyo11/shipcast/blob/main/docs/launches-repo.md) describes the contract), and an account on each network you want. On Linux the keychain needs `libsecret-tools`, and the demo video needs ffmpeg.

```bash
pnpm install
cp .env.example .env              # fill in what you use
pnpm shipcast preflight owner/repo
pnpm shipcast launch owner/repo   # or: pnpm app
```

A network or source without its variables is left out, and `pnpm shipcast status` shows what is on.

## What comes next

The next phase covers other AI providers besides claudio, a GitHub Action mode, a one-command install, and the setup of the company brand. The test of this release is to launch Shipcast with Shipcast on every connected channel.

The code is MIT-licensed at [github.com/yeyo11/shipcast](https://github.com/yeyo11/shipcast). Issues are welcome, and please open one before a pull request.
