# YouTube, the Short

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Title: Sluice: one queue for the tests and builds of all your AI agents
Tags: `sluice`, `ai agents`, `claude code`, `mcp`, `rust`, `developer tools`, `coding agents`, `git hooks`, `test cache`, `linux`, `open source`

---

Working with many AI agents in parallel, my machine ran the same tests and builds over and over until it ran out of memory. Sluice puts the tests, builds and heavy commands of every agent on a Linux machine in one queue, under one CPU and memory budget, and runs each check once per git tree.

What the Short shows, measured on my two machines: a cached typecheck answering in 0.22 s instead of 54 s, about 28 hours of checks that did not run in a week, and 0 out-of-memory episodes in 2.5 days since version 0.6.0.

Open source (MIT), written in Rust. It works with any AI coding agent that supports MCP, and Claude Code has a plugin.

---

Scenes (drawn into the video; change them in pack.json):

1. card, Many AI agents, one machine (6 s): Working with many AI agents in parallel, my machine ran the same tests and builds over and over.
2. card, Until memory ran out (5 s): Until it ran out of memory and Linux started killing processes.
3. card, Sluice (6 s): So I built Sluice: one queue for the tests, builds and heavy commands of all my agents.
4. screenshot (7 s): Each check runs once per git tree. A cached typecheck answers in 0.22 s instead of 54 s.
5. screenshot (7 s): About 28 hours of checks that did not run in a week, on my two machines.
6. screenshot (7 s): Each job in its own cgroup, under one memory budget: 0 out-of-memory episodes in 2.5 days.
7. card, Works with any MCP agent (6 s): It works with any agent that supports MCP, and Claude Code has a plugin.
8. cover (5 s): How to install it and the measured numbers: in the article, linked in the description.
