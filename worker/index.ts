// The Worker in front of the site's static assets (wrangler.jsonc). It runs only for the paths listed
// in `assets.run_worker_first`; everything else is served by Cloudflare straight from dist/.
//
// - `/` answers a 302 to /es/ or /en/ (see chooseLanguage), never cached, since it differs per reader.
// - An article asked for with `Accept: text/markdown` is answered with its Markdown (/<lang>/<slug>.md).
// - The redirects of the paths it runs for, which Cloudflare's _redirects skips for those paths.
// - Every response it returns gets the headers of src/headers.mjs, which _headers does not add to
//   responses that pass through a Worker.
import { SECURITY_HEADERS } from '../src/headers.mjs';
import { chooseLanguage, prefersMarkdown } from './negotiate.ts';

interface Env {
  ASSETS: Fetcher;
}

/** Paths published before they were translated or moved; never remove one */
const REDIRECTS: Record<string, string> = {
  '/es/privacy/': '/es/privacidad/',
};

const ARTICLE = /^\/(en|es)\/([a-z0-9-]+)\/$/;

function withHeaders(response: Response, extra: Record<string, string> = {}): Response {
  const out = new Response(response.body, response);
  for (const [name, value] of Object.entries({ ...SECURITY_HEADERS, ...extra })) out.headers.set(name, value);
  return out;
}

function redirect(location: string, status: 301 | 302, extra: Record<string, string> = {}): Response {
  return withHeaders(new Response(null, { status, headers: { Location: location } }), extra);
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      const lang = chooseLanguage(request.headers.get('Cookie'), request.headers.get('Accept-Language'));
      return redirect(`/${lang}/${url.search}`, 302, { Vary: 'Accept-Language, Cookie', 'Cache-Control': 'private, no-store' });
    }

    const moved = REDIRECTS[url.pathname];
    if (moved) return redirect(`${moved}${url.search}`, 301);

    const article = ARTICLE.exec(url.pathname);
    if (article && (request.method === 'GET' || request.method === 'HEAD')) {
      if (prefersMarkdown(request.headers.get('Accept'))) {
        const markdown = await env.ASSETS.fetch(new URL(`/${article[1]}/${article[2]}.md`, url), { method: request.method });
        if (markdown.ok) {
          return withHeaders(markdown, { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept', 'Content-Location': `/${article[1]}/${article[2]}.md` });
        }
      }
      // The same URL answers HTML or Markdown, so a cache must keep them apart
      return withHeaders(await env.ASSETS.fetch(request), { Vary: 'Accept' });
    }

    return withHeaders(await env.ASSETS.fetch(request));
  },
} satisfies ExportedHandler<Env>;
