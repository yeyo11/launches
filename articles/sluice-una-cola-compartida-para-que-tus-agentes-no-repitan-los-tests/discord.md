# Discord

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

**Sluice: one queue for every build, test and heavy command your agents run** 🚦

Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks.

Sluice queues the tests, builds and heavy commands of every agent on the machine. It's open source (MIT) and written in Rust.

• Each gate (tests, linters, type checks) runs once per git tree and the result is cached
• One CPU and memory budget, with each job in its own cgroup
• Backfilling so short jobs don't wait behind a 12 GB suite
• MCP server for any agent that supports MCP, plus a Claude Code plugin

On my two machines it skipped about 28 hours of checks in a week. The article has the install steps and how I measured everything.

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=discord
