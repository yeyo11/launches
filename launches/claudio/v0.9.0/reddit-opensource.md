# Reddit, r/opensource

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

**Claudio (MIT): a REST API and web UI over the Claude Code CLI**

I released Claudio v0.9.0, an MIT-licensed project that runs the Claude Code CLI as a service: a Fastify REST API with an OpenAPI 3.1 document, a React web UI, and an Electron app for Linux.

The design constraint is written into CONTRIBUTING.md and CLAUDE.md: Claudio reaches an agent only through the interface its vendor ships for programs (CLI flags, the official SDK, a documented protocol, files the CLI writes). No terminal scraping, no undocumented HTTP endpoints. The table of every surface in use is in docs/cli-surfaces.md, and the docs folder doubles as the project's knowledge base: each feature and decision has a page.

It began as a fork of Agentry (0.37.1) that I narrowed to Claude Code only and renamed. Claudio is independent and not affiliated with Anthropic.

Open questions for contributors: a second provider is described in docs/providers.md but not built, and the roadmap lists what was decided against, with reasons (native app-store shells, per-user push, a browser OIDC flow). Commits follow Conventional Commits and release-please builds the changelog.

Write-up: https://josegarrido.dev/en/claudio-run-claude-code-as-a-service/?ref=reddit
Repo: https://github.com/yeyo11/claudio
