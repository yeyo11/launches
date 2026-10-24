# Instagram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Media: the demo, as a Reel.

Claude Code lives in a terminal. I wanted to start a chat from my phone and see which agent needs an answer.

So I built Claudio: it runs Claude Code as a service.

What v0.9.0 does:
- puts the Claude Code CLI behind a REST API and a web UI
- streams chats and lets you answer permission prompts
- runs agents in parallel, each in its own git worktree
- moves work to another Claude account before a limit
- shows the diff of what the agents changed

It only uses the interface the CLI ships for programs. Self-hosted, MIT. Linux desktop app, Docker image, or from source.

Honest limits: one shared credential, no per-user permissions, auth off on source installs until you turn it on, Claude Code is the only provider.

Full write-up and install commands: link in bio.

#claudecode #claude #ai #aiagents #opensource #selfhosted #developer #devtools #coding #programming #typescript #nodejs #docker #linux #rest #api #git #automation #buildinpublic #indiedev
