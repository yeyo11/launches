# Discord

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

I set up **REA** (Reverse Engineer Anything) in Claude Code and tested it on YouTube's player, checking every answer against my own network log.

REA is an open-source (MIT) toolset that lets an agent inspect software without its source code. It works as a CLI and as an MCP server.

What I asked and what I found:
- **What loads before the video?** 81 requests in 28 seconds. It matched my log.
- **What does the browser send while you watch?** It matched too, and `observe-web-execution` adds the call stack of each request.
- **How does it pick quality?** REA didn't find where. I measured it with the browser instead.

The article has the install commands, the scenario file and the numbers.

https://josegarrido.dev/en/i-set-up-rea-and-test-it-on-youtube/?ref=discord
