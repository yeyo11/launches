# Telegram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

🔎 I set up REA (Reverse Engineer Anything) in Claude Code and asked it what YouTube's player loads, what it sends while you watch and how it picks quality.

I checked every answer against my own network log over the DevTools protocol:

✅ The network inventory matched request by request
✅ It adds the call stack of each request
❌ It didn't find where quality is decided: the two big scripts stay unanalysed

The article has the install commands, the scenario file and the numbers.

https://josegarrido.dev/en/i-set-up-rea-and-test-it-on-youtube/?ref=telegram
