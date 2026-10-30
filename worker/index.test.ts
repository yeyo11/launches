import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.ts';

// The links Shipcast publishes carry utm_source, utm_medium, utm_campaign and utm_content (its
// docs/tracking.md); Umami reads them from the landing page's URL, so the Worker must keep the query
// string on every path it answers or redirects.
const UTM = '?utm_source=bluesky&utm_medium=social&utm_campaign=sluice-v1-0-0&utm_content=en';

/** Runs the Worker with an assets binding that records what it was asked for */
async function serve(path: string, headers: Record<string, string> = {}) {
  const asked: string[] = [];
  const env = {
    ASSETS: {
      fetch: async (input: Request | URL | string) => {
        asked.push(String(input instanceof Request ? input.url : input));
        return new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } });
      },
    },
  };
  const request = new Request(`https://josegarrido.dev${path}`, { headers });
  const call = worker.fetch as unknown as (request: Request, env: unknown) => Promise<Response>;
  return { response: await call(request, env), asked };
}

test('the bare domain keeps the UTM tags on its way to a language', async () => {
  const { response } = await serve(`/${UTM}`, { 'Accept-Language': 'es-ES' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), `/es/${UTM}`);
});

test('an article with UTM tags is served as the article, query string included', async () => {
  const { response, asked } = await serve(`/en/sluice/${UTM}`);
  assert.equal(response.status, 200);
  assert.deepEqual(asked, [`https://josegarrido.dev/en/sluice/${UTM}`]);
});

test('a moved page keeps the UTM tags in its redirect', async () => {
  const { response } = await serve(`/es/privacy/${UTM}`);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), `/es/privacidad/${UTM}`);
});
