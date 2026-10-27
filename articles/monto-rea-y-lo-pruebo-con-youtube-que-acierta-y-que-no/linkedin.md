# LinkedIn

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

I asked an agent to explain what YouTube's player does when you press play. Then I checked every answer myself.

I set up REA (Reverse Engineer Anything), an open-source MIT toolset that lets an agent inspect software without its source code, and ran it from Claude Code against YouTube. I verified each answer with my own network log over the DevTools protocol and the player's stats panel.

What held up:
- The network inventory matched my log request by request: 81 requests in 28 seconds, with the 19-second video arriving in a single POST.
- observe-web-execution gives the call stack of each request, so you know which script and function sent it (reportStats in base.js for the qoe report).

What didn't:
- analyze-web-bundle left the two scripts that matter (12.4 of 13.7 MB) unanalysed, even with 10 minutes per script.
- So REA did not find where quality is decided. What I know about that came from the browser.

Using it from Claude Code also depends on the prompt: one run read a 1.17-million-character result for 12 turns without answering, another picked a tool that only records navigation. Naming the tool and the origins fixed it.

The article has the commands, the scenario file and the numbers.

#ClaudeCode #MCP #ReverseEngineering
