import { test } from 'node:test';
import assert from 'node:assert/strict';
import { umamiConfig } from './umami.mjs';

test('nothing until both the script and the website id are set', () => {
  assert.equal(umamiConfig({}), undefined);
  assert.equal(umamiConfig({ UMAMI_SCRIPT_URL: 'https://stats.example.com/script.js' }), undefined);
  assert.equal(umamiConfig({ UMAMI_WEBSITE_ID: 'id' }), undefined);
  // An unset repository variable reaches the build as an empty string
  assert.equal(umamiConfig({ UMAMI_SCRIPT_URL: '', UMAMI_WEBSITE_ID: '' }), undefined);
});

test('a self-hosted Umami loads from and sends to its own origin', () => {
  assert.deepEqual(umamiConfig({ UMAMI_SCRIPT_URL: 'https://stats.example.com/script.js', UMAMI_WEBSITE_ID: ' id ' }), {
    src: 'https://stats.example.com/script.js',
    websiteId: 'id',
    hostUrl: undefined,
    scriptOrigin: 'https://stats.example.com',
    connectOrigin: 'https://stats.example.com',
  });
});

test("Umami Cloud's tracker sends to its gateway, and UMAMI_HOST_URL overrides either", () => {
  const cloud = umamiConfig({ UMAMI_SCRIPT_URL: 'https://cloud.umami.is/script.js', UMAMI_WEBSITE_ID: 'id' });
  assert.equal(cloud?.scriptOrigin, 'https://cloud.umami.is');
  assert.equal(cloud?.connectOrigin, 'https://gateway.umami.is');
  const proxied = umamiConfig({ UMAMI_SCRIPT_URL: 'https://cloud.umami.is/script.js', UMAMI_WEBSITE_ID: 'id', UMAMI_HOST_URL: 'https://a.example.com/' });
  assert.equal(proxied?.hostUrl, 'https://a.example.com');
  assert.equal(proxied?.connectOrigin, 'https://a.example.com');
});

test('a malformed or plain-HTTP URL stops the build', () => {
  assert.throws(() => umamiConfig({ UMAMI_SCRIPT_URL: 'stats/script.js', UMAMI_WEBSITE_ID: 'id' }), /not a URL/);
  assert.throws(() => umamiConfig({ UMAMI_SCRIPT_URL: 'http://stats.example.com/script.js', UMAMI_WEBSITE_ID: 'id' }), /https/);
});
