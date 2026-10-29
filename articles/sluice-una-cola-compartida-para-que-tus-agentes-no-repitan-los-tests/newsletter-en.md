# Newsletter (en)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: From agents fighting over the machine to zero crashes: how Sluice works
Preview: Each gate runs once per git tree, under one CPU and memory budget. About 28 hours of checks skipped in a week.

Hi,

Working with several AI agents in parallel, my machine spent the day running the same tests and builds over and over, until it ran out of memory. So I built Sluice, and I've just published it as open source.

Sluice queues the tests, builds and heavy commands of every agent on a Linux machine. Each gate runs once per git tree, under a common CPU and memory budget. On my two machines that meant about 28 hours of tests and linters that did not run in a week.

In the article I cover how to connect it to your agent (Claude Code or any other that supports MCP), how it avoids running out of memory, how backfilling made the queue wait per minute of work drop about 4x in my measurement, and how it works with husky hooks you can't edit. I also show the numbers and how I measured them.

[Read the article](https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=newsletter)

José Antonio
