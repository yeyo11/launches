# Instagram

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Carousel, from the images in `public/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/` (their texts are drawn into them; only the caption and the comment below can be edited here):

1. Cover: I set up REA and test it on YouTube: what it gets right and what it doesn't. I set up REA in Claude Code and tested it on YouTube's player, checking every answer against my own network log.
2. Network inventory that matches: REA's list of requests matched my own DevTools log request by request: 81 requests in 28 seconds.
3. Call stack of each request: With observe-web-execution, REA shows which script and function sent each request, like reportStats in base.js.
4. Where it falls short: The two big scripts, 12.4 of 13.7 MB, stay unanalysed even with 10 minutes per script.
5. Closing: the full write-up is in my bio

Story: the cover with "Link in bio" (the API cannot add a link sticker).

Comment: Full write-up: josegarrido.dev/en/i-set-up-rea-and-test-it-on-youtube/ (link in bio). What would you use it for?

---

What does YouTube's player really do when you press play?

I set up REA (Reverse Engineer Anything) in Claude Code and asked it what the player loads, what it sends and how it picks quality. I checked every answer against my own network log.

It got the network right. It did not find where quality is decided.

Link in bio.

#ClaudeCode #MCP #ReverseEngineering #DevTools #OpenSource
