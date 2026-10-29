# Threads

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks. For a while they kept freezing my machine, so I built Sluice: one queue for the tests, builds and heavy commands of every agent on the machine, where each gate runs once per git tree. About 28 hours of checks skipped in a week. 🚦

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=threads
