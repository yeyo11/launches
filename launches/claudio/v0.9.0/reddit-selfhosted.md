# Reddit, r/selfhosted

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

**Claudio: self-hosted web UI and REST API for Claude Code (Docker, MIT)**

I run Claude Code on a server and got tired of SSH sessions to check on it, so I wrote Claudio: a REST API and web UI over the Claude Code CLI. MIT licensed, runs with your own Claude login.

Deploy:

```bash
docker run -d --init --name claudio --restart unless-stopped -p 127.0.0.1:8797:8797 \
  -v claudio-config:/home/node/.claude -v claudio-data:/data -v claudio-workspace:/workspace \
  ghcr.io/yeyo11/claudio
```

The image is non-root with the CLI pinned. The first start prints an owner token once (`docker logs claudio`). There is also a Compose file with a TLS-proxy profile and a Helm chart, and the app is installable as a PWA with Web Push on a phone.

Security, since it matters here: the container makes an owner token, but a source install or desktop app has auth off by default. Modes are none, bearer token (SHA-256 stored) or OIDC JWT validation. There is a single credential for everyone who holds it, no per-user permissions, and Claudio does not terminate TLS, so put a reverse proxy in front. With auth off, anyone reaching the port can start a chat on your account and read the transcripts. [docs/securing.md](https://github.com/yeyo11/claudio/blob/main/docs/securing.md) covers it.

Other limits: amd64 image, workers do not survive a restart (the task is marked interrupted and continues), Web Push needs HTTPS, and it is pre-1.0.

Write-up: https://josegarrido.dev/en/claudio-run-claude-code-as-a-service/?ref=reddit
Repo: https://github.com/yeyo11/claudio
