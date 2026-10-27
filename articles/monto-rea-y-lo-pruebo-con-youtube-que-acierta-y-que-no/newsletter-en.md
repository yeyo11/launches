# Newsletter (en)

> **Approval:** published when this pull request is merged. Edit it here if it needs changes.

Subject: I tested REA on YouTube: what it gets right and what it doesn't
Preview: REA matched my network log request by request, but couldn't find where YouTube decides quality.

Hi,

I wanted to know what YouTube's player really does when you press play, so I set up REA (Reverse Engineer Anything) in Claude Code and asked it three questions: what the page loads, what the browser sends while you watch, and how the player picks the quality.

I checked every answer against my own network log and the player's stats panel. REA got the network inventory right and adds the call stack of each request. It did not find where the quality decision lives, and I say so in the article.

You'll find the install commands, the scenario file and the numbers there, so you can repeat it.

[Read the article](https://josegarrido.dev/en/i-set-up-rea-and-test-it-on-youtube/?ref=newsletter)

José Antonio
