// Tells the search engines that share IndexNow (Bing, Yandex, Seznam, Naver…) which URLs changed in a
// production deploy: node scripts/indexnow.mjs <before-sha> <after-sha>. The articles added, changed or
// removed between the two commits, plus each language's front page, feed and llms.txt when any did.
// The key is public by design: it is the file public/<key>.txt, which proves the site owns it.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const SITE = 'https://josegarrido.dev';
const key = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace(/\.txt$/, '');
if (!key) throw new Error('No IndexNow key file in public/');

const [before, after = 'HEAD'] = process.argv.slice(2);
// A first push, or a force push, has no usable "before": take the last commit alone
const range = before && !/^0+$/.test(before) ? [before, after] : [`${after}~1`, after];
let changed = [];
try {
  changed = execFileSync('git', ['diff', '--name-only', ...range, '--', 'src/content/posts'], { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  console.log('IndexNow: could not diff the range; nothing submitted');
  process.exit(0);
}

const urls = new Set();
for (const file of changed) {
  const match = /^src\/content\/posts\/(en|es)\/([^/]+)\.md$/.exec(file);
  if (!match) continue;
  urls.add(`${SITE}/${match[1]}/${match[2]}/`);
  urls.add(`${SITE}/${match[1]}/`);
  urls.add(`${SITE}/${match[1]}/rss.xml`);
}
if (urls.size > 0) urls.add(`${SITE}/llms.txt`);
if (urls.size === 0) {
  console.log('IndexNow: no article changed; nothing submitted');
  process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: [...urls] }),
});
console.log(`IndexNow: ${response.status} for ${urls.size} URLs\n${[...urls].join('\n')}`);
// 200 and 202 are accepted; anything else is reported but never fails the deploy
if (![200, 202].includes(response.status)) console.log(`::warning::IndexNow answered ${response.status}: ${await response.text()}`);
