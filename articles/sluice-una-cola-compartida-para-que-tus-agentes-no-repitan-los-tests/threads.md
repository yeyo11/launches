# Threads

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

I run dozens of AI coding agents at once, and for a while they kept freezing my machine while rerunning the same tests on code that had already passed. So I built Sluice: a shared queue and cache where each gate runs once per git tree. About 28 hours of checks skipped in a week. 🚦

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=threads
