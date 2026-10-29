# Telegram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

🚦 Running several AI coding agents on one Linux machine? Sluice is a shared verification queue and cache.

✅ Each gate (tests, linters, type checks) runs once per git tree
🧠 One CPU and memory budget, each job in its own cgroup
⏱ Backfilling: wait per minute of work went from 1.92 to 0.44 min
💾 About 28 hours of checks skipped in a week on my two machines

Open source (MIT), written in Rust. Works with any agent that supports MCP, with a plugin for Claude Code. It doesn't replace your CI.

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=telegram
