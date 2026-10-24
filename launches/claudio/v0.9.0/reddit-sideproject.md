# Reddit, r/SideProject

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

**Claudio: I turned the Claude Code CLI into a service with a REST API and web UI**

Claude Code only lives in a terminal, so I built Claudio to use it from anywhere. It puts the CLI behind a REST API and a web UI (plus a Linux desktop app and a phone-installable PWA) and adds what I kept wanting: parallel agents in separate git worktrees, a diff review screen, and rotation between several Claude accounts when one runs out of quota.

The rule I held to: only use what the CLI ships for programs (stream-json, flags, the transcripts it writes). That keeps it honest but caps it. If the CLI cannot do something, Claudio cannot either.

It grew into a lot more than I planned: a task board with work items, a team of agents with a flow by column, schedules, usage and cost over time. It is a Claude-only fork of an earlier project, Agentry.

Write-up: https://josegarrido.dev/en/claudio-run-claude-code-as-a-service/?ref=reddit
Code (MIT): https://github.com/yeyo11/claudio

Feedback welcome, especially on what feels like too much.
