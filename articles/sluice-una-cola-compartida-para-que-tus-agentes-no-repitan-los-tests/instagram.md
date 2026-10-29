# Instagram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Carousel, from the images in `public/articles/sluice-una-cola-compartida-para-que-tus-agentes-no-repitan-los-tests/` (their texts are drawn into them; only the caption and the comment below can be edited here):

1. Cover: Sluice: one queue for every build, test and heavy command your agents run. It queues the tests, builds and heavy commands of every agent on the machine and runs each gate once per git tree.
2. Run each gate once: The cache key is the exact git tree plus the gate definition, shared by all worktrees. A cached typecheck answers in 0.22 s.
3. Memory-aware scheduling: Sluice learns each gate's memory use, isolates jobs in cgroups and makes them the first victims if memory runs short.
4. Backfilling the queue: Short jobs no longer wait behind a 12 GB suite: queue wait per minute of work dropped about 4x in my measurement.
5. Closing: the full write-up is in my bio

Story: the cover with "Link in bio" (the API cannot add a link sticker).

Comment: Full write-up: josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/ (link in bio). What would you use it for?

---

Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks.

Sluice is open source and queues the tests, builds and heavy commands of every AI agent on a Linux machine. It runs each gate once per git tree, under a common CPU and memory budget, and works with any agent that supports MCP, with a plugin for Claude Code.

Link in bio.

#sluice #claudecode #rust #aiagents #opensource
