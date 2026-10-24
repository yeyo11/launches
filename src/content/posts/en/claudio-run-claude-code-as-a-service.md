---
title: "Claudio: run Claude Code as a service"
description: "Claudio puts the Claude Code CLI behind a REST API and a web UI, runs agents in parallel in their own worktrees and rotates between Claude accounts. Here is how it works and what it cannot do."
pubDate: 2026-10-24
lang: en
translationKey: "claudio-run-claude-code-as-a-service"
repo: "https://github.com/yeyo11/claudio"
version: "v0.9.0"
tags: ["claude-code", "self-hosted", "ai-agents", "open-source"]
image: "/launches/claudio/v0.9.0/og.png"
---

Claude Code lives in a terminal. That is fine until you want to start a chat from your phone, check on an agent that is still working while you are away from the desk, or run five of them in parallel without losing track of which one needs an answer. I built Claudio to cover that gap: it runs Claude Code as a service.

This post covers what Claudio is, how it talks to Claude Code, how to install it, and, because it is a 0.9 release, what does not work yet.

## What you get

Claudio puts the Claude Code CLI behind a REST API and a web UI. The same server also backs a Linux desktop app and an installable web app for your phone. Everything runs on your machine or your server, with your own Claude login.

- Chats you can start, stream and answer from a browser or over HTTP.
- Orchestrations: a graph of tasks run by parallel workers, each in its own git worktree.
- Several Claude accounts, with work moving to the one that still has quota.
- A review screen for what the agents changed.
- Projects with a task board and a team of agents.

I will go through them one at a time.

## The one rule: only the interface the CLI ships for programs

Claudio does not scrape the terminal, call undocumented endpoints or log in a second time on its own. It reaches Claude Code through the CLI's flags, its stream protocol and the files it writes. [docs/cli-surfaces.md](https://github.com/yeyo11/claudio/blob/main/docs/cli-surfaces.md) lists every surface in use, one row per need. For example:

```text
Run / continue a conversation  claude -p --input-format stream-json --output-format stream-json
Auth status                    claude auth status --json
Session history                $CLAUDE_CONFIG_DIR/projects/*/*.jsonl
```

The practical consequence is a ceiling: what the CLI cannot do, Claudio cannot do. Web artifacts and claude.ai chat memory have no CLI surface, so Claudio does not touch them.

## Chats over HTTP

A chat is one long-lived `claude` process fed over stdin, with `--resume` when the process is gone. You can start one from the UI or from the API:

```bash
curl -X POST http://localhost:8797/api/chats \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Add a unit test for parseDuration", "cwd": "/workspace/my-app"}'
```

The request also accepts `worktree` (run inside a new git worktree of that name) and `jsonSchema` (structured output). From there you have `POST /api/chats/:id/messages`, `/stop`, `/interrupt`, `/resume` and `/fork`, and `GET /api/chats/:id/stream` to follow it. When the agent asks for permission, a question or a plan approval, you answer from the UI (or `POST /api/chats/:id/permissions/:requestId`).

The interactive reference is served at `/docs` and the OpenAPI 3.1 document at `/openapi.json`. If you turned authentication on, send `Authorization: Bearer <token>`.

The UI does not poll. One server-sent events feed, `GET /api/events`, carries chats, prompts waiting for you, tasks, orchestrations and account rotation, and it resumes with `Last-Event-ID` after a drop.

## Orchestrations

An orchestration is a graph of tasks. Workers run in parallel, each in its own git worktree, and their branches are merged into one integration branch. After that, a verification phase runs your checks (build, tests) on the integration branch under a timeout, and a pull request can be offered. It exists as the `POST /api/orchestrations` route and as a screen where you follow the run as steps.

Two things to watch for: the checks need `worktree: true` on the graph engine, and workers do not survive a restart. A task caught by one is marked `interrupted` and its chat continues in a new execution while it has attempts left.

## Several accounts, rotated

Each Claude account gets its own `CLAUDE_CONFIG_DIR` and is signed in once. Claudio reads usage per window, moves new work to an account with quota before a limit is hit, replays a turn that hits its limit on the next account, and waits for the reset only when none has any quota left. There is also a small CLI, `claudio-accounts`, in `packages/accounts`.

Limits: a running `claude` is never moved to another account, only the next launch is. And an idle account's usage is as fresh as its last refresh, because the CLI offers no event for it.

## Reviewing changes inside Claudio

For a chat, a task or the integration branch there is a diff screen built from git and the transcript. Each edit carries the sentence Claude wrote just before it, so you read the change together with its reason.

## Projects, a board and a team

You can import a directory as a project. It gets a Tasks board with work items (`AGN-12`-style keys, five fixed columns, epics, milestones), and a team where each member is a Claude Code agent file with a role. With the flow switched on, a card entering a column starts that role's run. Only you move a card to Done.

## Guards

Claudio can add `PreToolUse` hooks that hold even in `bypassPermissions`: no push, no `--no-verify`, no recursive delete outside the worktree, no secret written. They are on for orchestration workers and the flow, and configurable per project for chats. The mechanism is a settings file with only Claudio's hooks, passed with `--settings`. See [docs/guards.md](https://github.com/yeyo11/claudio/blob/main/docs/guards.md).

## Install

**Docker** (amd64):

```bash
docker run -d --init --name claudio --restart unless-stopped -p 127.0.0.1:8797:8797 \
  -v claudio-config:/home/node/.claude -v claudio-data:/data -v claudio-workspace:/workspace \
  ghcr.io/yeyo11/claudio
```

Open `http://localhost:8797`, sign in with the owner token the container printed once (`docker logs claudio`), then sign in to Claude in the setup assistant. Name all three volumes, or replacing the container to update starts again with empty ones.

**Desktop app** (Linux x86_64, `.deb` or AppImage):

```bash
curl -fsSL https://raw.githubusercontent.com/yeyo11/claudio/main/scripts/install.sh | bash
```

As with any script piped to a shell, read it first. The app runs with your own `claude` and `~/.claude` login, so nothing is sandboxed and chats start in `acceptEdits`.

**From source** (Node 22+, pnpm 10, a logged-in `claude` on your `PATH`):

```bash
git clone https://github.com/yeyo11/claudio && cd claudio
pnpm install
pnpm dev          # API on :8797, UI on :5181
```

Then: open Claudio, let the setup assistant check Claude Code, press New chat, pick a directory and write a prompt.

## Before you expose it

A container creates an owner token on its first start. A source install or the desktop app has authentication off until you turn it on. That is right for a port bound to `127.0.0.1` and wrong for anything else: with auth off, anyone who reaches the port can start a chat on your account and read every transcript on the machine. The modes are `none`, `token` (only the SHA-256 is stored) and `oidc` (Claudio validates a JWT; it does not log anyone in). Claudio does not terminate TLS, so put a proxy in front. [docs/securing.md](https://github.com/yeyo11/claudio/blob/main/docs/securing.md) has the details.

## What does not work yet

- One credential for everyone who holds it: no per-user isolation or permissions.
- Claude Code is the only provider that runs. The docs describe what a provider is, but there is no second one.
- The desktop app is Linux x86_64, the image is amd64.
- Web Push needs a secure origin; it does not work in the desktop app, and a subscription belongs to an install, not a person.
- Cancelling a single command needs Linux, because it reads `/proc`.
- It is version 0.9.0. Expect rough edges.

Claudio is a Claude-only fork of Agentry, an independent project, and is not affiliated with Anthropic.

## What comes next

The roadmap says nothing is planned right now. What is left was decided against for now, with reasons: native app-store shells, per-user push, offline use, a browser login flow for OIDC. If one of those matters to you, open an issue and tell me why.

The code is MIT-licensed at [github.com/yeyo11/claudio](https://github.com/yeyo11/claudio).
