# Newsletter (en)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: Sluice: a shared queue so your agents stop repeating tests
Preview: Each gate runs once per git tree, under one CPU and memory budget. About 28 hours of checks skipped in a week.

Hi,

I've just published Sluice, an open source tool I built because running many Claude Code agents on one machine kept freezing it, and the same tests kept running on code that had already passed.

Sluice is a verification queue and cache shared by every agent on a Linux machine. Each gate runs once per git tree, under a common CPU and memory budget. On my two machines that meant about 28 hours of tests and linters that did not run in a week.

In the article I cover how to install it with Claude Code, how it avoids running out of memory, how backfilling cut the wait per minute of work from 1.92 to 0.44 min, and how it works with husky hooks you can't edit. I also show the numbers and how I measured them.

[Read the article](https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=newsletter)

José Antonio
