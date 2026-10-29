# Mastodon

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Orchestrating dozens of AI agents on one machine has a hidden cost: each one runs its own tests, builds and hooks.

Sluice queues the tests, builds and heavy commands of every agent on the machine, under one CPU and memory budget, and runs each gate once per git tree.

Open source, MIT, in Rust. About 28 hours of checks skipped in a week on my two machines.

https://josegarrido.dev/en/sluice-shared-queue-so-your-agents-stop-repeating-tests/?ref=mastodon

#Rust #ClaudeCode #AIAgents #OpenSource
