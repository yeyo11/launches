# Reddit, r/ClaudeAI

> **Manual:** Shipcast never posts this. Copy it and post it yourself.

**I built Claudio: Claude Code behind a REST API and web UI, with account rotation**

Claude Code is a terminal tool, and I wanted to start and answer chats from my phone, run several agents in parallel, and not stop when one account hits its limit. So I built Claudio (MIT, self-hosted).

How it works: it drives the `claude` CLI through `claude -p --input-format stream-json --output-format stream-json`, control requests, flags and the transcripts the CLI writes. No terminal scraping, no undocumented endpoints, no second login. [docs/cli-surfaces.md](https://github.com/yeyo11/claudio/blob/main/docs/cli-surfaces.md) lists every surface it uses.

What it does today (v0.9.0):

- Chats from a web UI or `POST /api/chats`, with permission prompts, questions and plan approvals answered from the UI.
- Orchestrations: a task graph run by parallel workers in their own git worktrees, merged on an integration branch, then verified.
- Several accounts, each with its own `CLAUDE_CONFIG_DIR`; new work goes to an account with quota, and a turn that hits a limit is replayed on the next one.
- A diff screen that shows the sentence Claude wrote before each edit.
- Optional guards (`PreToolUse` hooks) that hold even in `bypassPermissions`.

It is a Claude-only fork of Agentry, independent, not affiliated with Anthropic.

Write-up with install commands: https://josegarrido.dev/en/claudio-run-claude-code-as-a-service/?ref=reddit
Repo: https://github.com/yeyo11/claudio

I would like to hear which parts of the CLI's program interface you wish were richer.
