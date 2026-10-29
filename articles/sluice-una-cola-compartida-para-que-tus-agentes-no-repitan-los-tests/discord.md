# Discord

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

**Sluice: one queue for every build, test and heavy command your agents run** 🚦

If you run several Claude Code agents on one Linux machine, you know the pain: five agents, five test suites at once, and the same tests rerunning on code that already passed.

Sluice is a verification queue and cache shared by all the agents on the machine. It's open source (MIT) and written in Rust.

• Each gate (tests, linters, type checks) runs once per git tree and the result is cached
• One CPU and memory budget, with each job in its own cgroup
• Backfilling so short jobs don't wait behind a 12 GB suite
• Works as a Claude Code plugin and MCP server

On my two machines it skipped about 28 hours of checks in a week. The article has the install steps and how I measured everything.

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=discord
