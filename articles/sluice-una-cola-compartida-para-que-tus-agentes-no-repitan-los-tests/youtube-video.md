# YouTube, the video

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Title: Sluice: one queue for the tests, builds and heavy commands of your AI agents
Tags: `sluice`, `ai agents`, `claude code`, `mcp`, `rust`, `developer tools`, `coding agents`, `git hooks`, `husky`, `test cache`, `build queue`, `cgroups`, `linux`, `open source`

---

Working with dozens of AI agents in parallel, each in its own git worktree, my machine spent the day running the same tests and builds over and over, until it ran out of memory. This video walks through Sluice, the open source queue and cache I built for it: it puts the tests, builds and heavy commands of every agent on a Linux machine in one queue, under one CPU and memory budget, and runs each check once per git tree.

What it shows, with the numbers measured on my two machines:
- the cache: a typecheck that took 54 s answers in 0.22 s, and about 28 hours of checks did not run in a week;
- memory: each job in its own cgroup and admitted only if its learned memory fits; 0 out-of-memory episodes in 2.5 days since version 0.6.0;
- backfilling: short jobs go ahead of a 12 GB test suite when they fit, and queue wait per minute of work dropped about 4x in my measurement;
- hung tests shown as STALLED, never killed;
- sluice hooks on, for hooks you can't edit, like husky's.

Sluice is MIT licensed and written in Rust. It works with any AI coding agent that supports MCP, and Claude Code has a plugin that sets everything up.

---

Scenes (drawn into the video; change them in pack.json):

1. card, Many AI agents, one machine (7 s): On a normal day I have dozens of AI agents working at once, each in its own git worktree.
2. card, Nothing coordinated them (8 s): Nothing coordinated them: the same tests and builds ran over and over, until memory ran out.
3. card, 52% already verified (8 s): I measured it: 52% and 38% of the checks on my two machines were on code already verified.
4. card, Sluice (7 s): Sluice puts the tests, builds and heavy commands of every agent on the machine in one queue.
5. card, Works with any MCP agent (7 s): It works with any agent that supports MCP, and Claude Code has a plugin that sets it all up.
6. screenshot (9 s): The cache key is the exact git tree plus the gate: a 54 s typecheck answers in 0.22 s.
7. screenshot (7 s): --explain shows the tree, the key and the cache lookup, without running anything.
8. screenshot (10 s): Measured by each daemon: about 28 hours of checks that did not run in a week, on two machines.
9. screenshot (8 s): Each job runs in its own cgroup, and a gate starts only if its learned memory fits.
10. card, 0 out-of-memory episodes (7 s): Since version 0.6.0: 0 out-of-memory episodes on the second machine in 2.5 days measured.
11. card, A 0.1 s linter waited 23 minutes (8 s): A 0.1-second linter waited up to 23 minutes behind a test suite that used 12 GB.
12. card, About 4x less waiting (9 s): With backfilling, queue wait per minute of work dropped about 4x, in my measurement.
13. card, STALLED, never killed (7 s): A hung test shows up as STALLED in sluice status, and the agent is told. Sluice never kills it.
14. card, sluice hooks on (7 s): With sluice hooks on, hooks you can't edit, like husky's, go through the queue too.
15. card, Try it (7 s): Open source, MIT, written in Rust. Install it and run sluice init in your repository.
16. cover (5 s): How to install it and the measured numbers are in the article, linked in the description.
