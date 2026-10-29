# Bluesky

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks. Sluice queues them and runs each gate once per git tree: ~28 h of checks saved in a week. https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=bluesky
