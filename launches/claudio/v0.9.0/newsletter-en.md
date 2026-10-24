# Newsletter (en)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: Claudio 0.9.0: Claude Code as a service
Preview: A REST API and web UI over the Claude Code CLI, with parallel agents and account rotation.

Hi,

I have been using Claude Code from a terminal for a long time, and I kept wanting to start a chat from my phone, see which agent was waiting on me, and keep working when one account ran out of quota. Claudio is what I built for that, and v0.9.0 is the first time I am presenting it properly.

It puts the Claude Code CLI behind a REST API and a web UI. It runs agents in parallel in their own git worktrees, shows you a diff of what changed, and moves work to another Claude account before a limit. It only uses the interface the CLI ships for programs, so it is as capable as the CLI and no more.

The article has the install commands for Docker, the Linux desktop app and a source checkout.

[Read the article](https://josegarrido.dev/en/claudio-run-claude-code-as-a-service/?ref=newsletter)

If you try it and something breaks, reply to this email or open an issue.

José Antonio
