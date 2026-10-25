# Product Hunt

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

Tagline: Launch GitHub projects on every channel from the code

Description: Shipcast reads your repo's code on each release, writes a piece for every channel and publishes each one after you approve it: blog, dev.to, Bluesky, Mastodon, Instagram, newsletter. Show HN and Product Hunt drafts included.

Website: https://github.com/yeyo11/shipcast

Maker's first comment:

Hi, I'm José Antonio, an open-source developer. I built Shipcast because every release meant an afternoon of rewriting the same announcement for a blog, dev.to, Bluesky, Mastodon, Instagram and a newsletter, and it was easy to promise something the code did not do yet.

What it does today: a .github/launch.yml sets a mode per channel (auto, approval, manual, off). On a release, or with `pnpm shipcast launch owner/repo`, a pre-flight check runs and Claude reads the repository, telling what is implemented from what is only planned. It generates the article in English and Spanish, a piece per channel, a launch image and an Instagram carousel, and opens a pull request with the drafts. Merging it publishes each channel once, recorded in a SQLite registry. A CLI and a web app cover launches, review, writing your own articles and connecting accounts, with secrets in the OS keychain.

It is MIT-licensed and in alpha. I used it to launch my project claudio. Questions and feedback welcome.

Gallery, from `public/launches/shipcast/v0.1.0/`:

- og.png
- instagram-01.jpg
- instagram-03.jpg
- instagram-04.jpg
- instagram-05.jpg
- instagram-06.jpg
