# Telegram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

🚦 Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks. Sluice queues the tests, builds and heavy commands of every agent on the machine.

✅ Each gate (tests, linters, type checks) runs once per git tree
🧠 One CPU and memory budget, each job in its own cgroup
⏱ Backfilling: queue wait per minute of work dropped about 4x in my measurement
💾 About 28 hours of checks skipped in a week on my two machines

Open source (MIT), written in Rust. Works with any agent that supports MCP, with a plugin for Claude Code.

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=telegram
