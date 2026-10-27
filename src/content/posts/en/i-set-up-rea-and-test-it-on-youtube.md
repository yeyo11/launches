---
title: "I set up REA and test it on YouTube: what it gets right and what it doesn't"
description: "I install REA in Claude Code and ask what YouTube's player loads, sends and how it picks quality, checking every answer against my own network log."
pubDate: 2026-10-27
lang: en
translationKey: "i-set-up-rea-and-test-it-on-youtube"
tags: ["rea", "claudecode", "mcp", "reverseengineering"]
image: "/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/og.png"
imageAlt: "REA (Reverse Engineer Anything) analysing the YouTube player from Claude Code"
---

I wanted to know what YouTube's player really does when you press play: what it downloads, what it sends while you watch and how it decides the quality. The browser DevTools show you that request by request, but reading hundreds of requests and 13 MB of minified JavaScript by hand is not a plan. So I set up [REA](https://github.com/morluto/rea) (Reverse Engineer Anything) with Claude Code and asked it those three questions.

REA is a set of open-source tools (MIT license) that lets an agent inspect software without having its source code: native binaries, Electron apps, Android APKs, WebAssembly and web pages. It works as a command line and as an MCP server. The official repository is `morluto/rea` and the npm package is `rea-agents`; there are several websites with similar names that are not the project's. I use version 6.8.0, the latest on npm as I write this.

I checked every REA answer through another path: my own network log over the DevTools protocol and the player's own stats panel. Where REA gets it right I say so, and where it falls short I say that too.

## What do you need?

- Node.js 24 (`npx` comes with it).
- Claude Code, if you want to use it from the agent.
- Google Chrome.
- **Nothing else.** Ghidra, IDA or Hopper are only needed for native binaries. For a website, REA brings everything it uses.

## How do you install REA in Claude Code?

`setup` shows you first what it is going to change and then applies it. Pin the version in every command so everything you do is reproducible:

```bash
npx -y rea-agents@6.8.0 setup --client claude_code --dry-run
npx -y rea-agents@6.8.0 setup --client claude_code --yes
npx -y rea-agents@6.8.0 doctor --client claude_code
```

![The setup plan, its application and doctor in green](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-setup.png)

The plan has two actions: register the MCP server in `~/.claude.json` as `npx -y rea-agents@6.8.0 mcp` and install the REA skill in `~/.claude/skills/`. After that, `doctor` returns `healthy: true`. It will warn you that Ghidra, IDA, Hopper and JADX are missing: they are engines for other kinds of target and do not affect what follows.

I did it with an empty `HOME`, so as not to touch my configuration and to see the same thing you would see from scratch. If you prefer REA to exist only in one project, put this in its `.mcp.json`:

```json
{
  "mcpServers": {
    "rea": { "command": "npx", "args": ["-y", "rea-agents@6.8.0", "mcp"] }
  }
}
```

## How do you open a Chrome that REA can observe?

REA watches the browser through the DevTools protocol. Open a Chrome with its own profile and the debugging port listening only on your machine:

```bash
google-chrome --remote-debugging-address=127.0.0.1 --remote-debugging-port=9333 \
  --user-data-dir="$(mktemp -d)" --mute-audio
```

A separate profile matters: anyone who reaches that port controls the browser, so never use your everyday one. Open a video and reject the cookies. I used two: "Me at the zoo" (YouTube's first video, 19 seconds) and *Big Buck Bunny*, from the Blender Foundation (CC BY license), which lasts long enough and has several qualities.

Rejecting the cookies is not optional: while the notice is open, the video stops at 2 seconds and there is nothing to observe.

With the browser ready, REA can already see it:

```bash
npx -y rea-agents@6.8.0 list-browser-targets http://127.0.0.1:9333
```

## Question 1: what does the page load before the video starts?

The tool for this is `capture-browser-scenario`: REA navigates to the URL you give it, runs the steps you declare and records the network. This is the scenario I used:

```json
{
  "browser": { "mode": "connect", "cdp_endpoint": "http://127.0.0.1:9333", "target_id": "<the id from list-browser-targets>" },
  "start_url": { "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  "environment": { "service_workers": "allow" },
  "actions": [
    { "step_id": "player", "action": "wait_for", "locator": { "kind": "css", "selector": "#movie_player video" }, "state": "attached", "timeout_ms": 20000 },
    { "step_id": "watch", "action": "wait_for_timeout", "duration_ms": 25000 }
  ],
  "capture": { "at_end": ["url", "screenshot"], "events": ["network", "page-errors"] }
}
```

```bash
npx -y rea-agents@6.8.0 capture-browser-scenario scenario.json --format json > scenario-out.json
```

The `"service_workers": "allow"` line is not decoration. Without it, REA refuses: YouTube registers a *service worker* and, by default, REA does not observe pages controlled by one. The error says so plainly and tells you what to change.

**What REA saw.** 81 requests in 28 seconds (85 in 29 when repeating it with a clean profile). Before the first video request, which goes out at second 1.3, the page asks for:

- the HTML of `/watch`;
- 17 thumbnails from `i.ytimg.com`;
- the player (`/s/player/…/base.js`) and the web modules;
- three *polyfills* (`web-animations-next-lite`, `webcomponents-sd`, `intersection-observer`);
- the stylesheets and the fonts.

Right with the first video request, the player's optional modules arrive: `offline.js`, `remote.js`, `miniplayer.js`, `captions.js`, `endscreen.js` and `annotations_module.js`.

**The check.** On another load of the same video I recorded the network myself, with the DevTools protocol. The same paths come out in the same order, with differences of tenths of a second; only a few recommendation thumbnails change. And a detail I did not expect: the 19 seconds of video arrive whole in **a single `POST` request** to `*.googlevideo.com/videoplayback`, of 480 KB.

**How much does it weigh?** With `analyze-web-bundle`, REA counts 50 scripts and 13.7 MB of JavaScript on the page. Two take almost all of it: the web core (9.7 MB) and the player, `base.js` (2.6 MB). I downloaded them separately with `curl` and they match byte for byte, with the same hash; compressed, they travel as 2 MB and 0.7 MB.

**Verdict:** REA gets it right. The inventory matches the browser's.

## Question 2: what does the browser send while you watch the video?

I repeated the scenario with *Big Buck Bunny* and 90 seconds of playback, and compared it again with my log. They match request by request. While you watch the video, the browser does this:

| Request | When, in the test |
| --- | --- |
| `POST *.googlevideo.com/videoplayback` | Every 3 to 9 seconds, while the buffer fills. Each response brings 0.5 to 1.1 MB of video, and each request carries 1.7 to 2 KB from the browser. |
| `POST /api/stats/watchtime` | Every 10 seconds (at 10, 20 and 30 s). |
| `POST /api/stats/qoe` | At the start and then every 10 to 30 seconds. |
| `POST /api/stats/playback` and `GET /ptracking` | Once, at the start. |
| `POST /api/stats/atr` | Once, at 2 seconds. |
| `POST /youtubei/v1/log_event` | A couple of times on load. |

At 40 seconds, the player already had 55 seconds of video downloaded ahead.

**What REA adds.** With `observe-web-execution`, REA gives the call stack of each request. The `qoe` report comes from the player, from a function called `reportStats` in `base.js`. The `watchtime` one comes from the web core, from `sendThenWrite`. In that capture, made while I was releasing the connection in question 3, the URLs of both carried `fmt=397` and `afmt=251`. They are the same identifiers that the player's "Stats for nerds" panel (right-click on the video) shows next to the codecs: `av01 (397)` at 480p, `av01 (394)` at 144p and `opus (251)` for the audio.

**Verdict:** REA gets it right, and the call stack gives you something the network tab does not show at a glance.

## Question 3: how does it pick the quality?

This was the hard one. To provoke the change, I throttled the connection to 300 kbit/s with the DevTools protocol (`Network.emulateNetworkConditions`) before opening the video. Halfway through the test I released it.

![Resolution on screen during the test: 480p, 144p with the connection throttled and 480p again 22 seconds after releasing it](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/chart-quality-es.png)

This is what the browser measured, sampling the resolution every 2 seconds:

1. **With the connection throttled**, the first 2 seconds look like 480p. At 6 seconds of video the player drops to 144p.
2. **When the connection is released**, the player switches *at that very moment* to requesting 480p, and its buffer jumps from 22 to 59 seconds.
3. **But the picture stays at 144p** until what was already downloaded has played. In this test it took 22 seconds. In another, 16. In a third it was still at 144p at 32 seconds, when the test ended.

![Stats for nerds with the connection throttled: current resolution 256x144, optimal 854x480, 139 kbps. Big Buck Bunny © Blender Foundation, CC BY 3.0](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/youtube-throttled.png)

![Stats for nerds after releasing the connection: 854x480, 12,511 kbps and 60 seconds of buffer. Big Buck Bunny © Blender Foundation, CC BY 3.0](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/youtube-released.png)

The panel confirms it: `256x144` against an optimal of `854x480` at 139 kbps, and then `854x480` at 12,511 kbps and 60 seconds of buffer. Its "Mystery Text" line shows "SABR", and the video arrives in `POST` requests that carry 1.7 to 2 KB from the browser each.

And an earlier experiment, the other way round: if you throttle the connection *after* filling the buffer, the quality does not drop. With 55 seconds already downloaded, the rest of the test (more than 40 seconds) played at 480p.

**What REA did.** I asked it where that decision lives in the code, and it did not get there.

- **`analyze-web-bundle`** analyses the JavaScript without running it. With its default setting (30 seconds per script), it ran out of time on exactly the two scripts that matter: the player and the web core, 12.4 of the 13.7 MB. I repeated it with 10 minutes per script and 6 GB of memory: 20 minutes and 4.6 GB later, the same result.
- **`observe-web-execution`** measures which functions run during a time window. I launched it a few seconds before releasing the connection, with a 15-second window: in that time 1,022 player functions ran. Almost all have minified names (`uHa`, `pz`, `Dz`…). The only readable things are browser APIs, like `appendBuffer`, which puts the video chunks into the buffer, and `getPlaybackQuality`.

![analyze-web-bundle on YouTube: the two big scripts are left unanalysed with 30 seconds and with 10 minutes per script](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-bundle.png)

**Verdict:** REA did not find where the quality is decided. What I know about question 3 was measured by the browser.

## How do you use it from Claude Code?

With the MCP server registered, you ask Claude Code in natural language. I tried it three times with `claude -p` and the result depended a lot on the prompt:

1. **A prompt that does not name the tool**, with a maximum of 12 turns. Claude used `inspect_web_page`, but REA's response was 1.17 million characters. That exceeds the output limit of an MCP tool in Claude Code, which saves it to a file, and the agent spent all 12 turns reading it without getting to an answer. Along the way it tried to pass `https://*.googlevideo.com` as an allowed origin, and REA rejected it: it only accepts exact origins, and the video servers change name every session.
2. **The same prompt, again.** This time it chose `observe_web_session`, which only records the page's navigation and not its requests. It answered, rightly, that it could tell me nothing.
3. **A prompt that names the tool**, its parameters and tells it to read the file with `jq`. Seven turns and 50 seconds.

![Claude Code with REA: the answer separates what was observed from its interpretation](/articles/monto-rea-y-lo-pruebo-con-youtube-que-acierta-y-que-no/rea-claude.png)

In those 10 seconds, the page made no request to `www.youtube.com`. REA filtered out 3 to other origins because they were not allowed, and Claude says so, separating what was observed from its interpretation. The lesson: tell it which tool to use and which origins, and be ready to read large results from a file.

## What does REA get right and what doesn't it?

- **It gets right** the network inventory: it matched my log request by request in every test.
- **It adds** the call stack of each request, which tells you which script and which function sent it.
- **It warns well.** Each output carries its limits, for example that observation starts when it connects or which requests it filtered by origin, and its errors say what to change.
- **It does not reach** static analysis of a bundle like YouTube's: the two scripts that matter are left unanalysed, even with 10 minutes per script.
- **It gives no useful names** in minified code: it knows which functions ran, not what they do.
- **It demands judgement from the agent.** Choosing the wrong tool (navigation only) or asking for a million-character result are easy mistakes.

## How do you repeat it?

With Chrome open as above and a video playing:

```bash
npx -y rea-agents@6.8.0 setup --client claude_code --yes
npx -y rea-agents@6.8.0 doctor --client claude_code
npx -y rea-agents@6.8.0 list-browser-targets http://127.0.0.1:9333
npx -y rea-agents@6.8.0 capture-browser-scenario scenario.json --format json > scenario-out.json
npx -y rea-agents@6.8.0 observe-web-execution http://127.0.0.1:9333 <target_id> --observation-ms 15000 --format json > execution.json
npx -y rea-agents@6.8.0 analyze-web-bundle http://127.0.0.1:9333 <target_id> --observation-ms 3000 --format json > bundle.json
```

The outputs are large JSON files; `jq` is your friend. For example, `jq '.normalized_result.events.items | length' scenario-out.json` counts the network events.

## Limits

All of this is observing what your browser already downloads and already sends, the same thing you would see in the DevTools, and explaining it. I did not touch anyone's session, nor the ads, nor the video protections, nor did I download videos. If you analyse a website, respect its terms of use.
