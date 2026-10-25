// What the sitemap says about each URL beyond its address: its translations (hreflang, x-default to
// English) and when it last changed, from the articles' own dates, never the build time. Read
// straight from the files because astro.config runs before content collections exist.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const PAGES = [
  { en: '/en/about/', es: '/es/sobre-mi/' },
  { en: '/en/privacy/', es: '/es/privacidad/' },
];

/** @param {string} site */
export function sitemapDetails(site) {
  const dir = join(process.cwd(), 'src/content/posts');
  /** @type {Array<{ lang: 'en' | 'es', path: string, key: string, modified: Date }>} */
  const posts = [];
  for (const lang of ['en', 'es']) {
    for (const file of readdirSync(join(dir, lang)).filter((f) => f.endsWith('.md'))) {
      const front = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(dir, lang, file), 'utf8'))?.[1];
      const data = front ? parse(front) : {};
      if (data.draft) continue;
      posts.push({ lang, path: `/${lang}/${file.replace(/\.md$/, '')}/`, key: data.translationKey, modified: new Date(data.updatedDate ?? data.pubDate) });
    }
  }
  /** @type {Map<string, { lastmod?: string, links: Array<{ lang: string, url: string }> }>} */
  const byUrl = new Map();
  const pair = (versions, lastmod) => {
    const links = Object.entries(versions).map(([lang, path]) => ({ lang, url: new URL(path, site).href }));
    if (versions.en) links.push({ lang: 'x-default', url: new URL(versions.en, site).href });
    for (const [lang, path] of Object.entries(versions)) byUrl.set(new URL(path, site).href, { lastmod: lastmod?.[lang], links: links.length > 2 ? links : [] });
  };
  // A language's front page changes when its newest article arrives
  const newest = (lang) => posts.filter((p) => p.lang === lang).map((p) => p.modified).sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString();
  pair({ en: '/en/', es: '/es/' }, { en: newest('en'), es: newest('es') });
  for (const page of PAGES) pair(page);
  for (const post of posts) {
    const versions = Object.fromEntries(posts.filter((p) => p.key === post.key).map((p) => [p.lang, p.path]));
    pair(versions, Object.fromEntries(posts.filter((p) => p.key === post.key).map((p) => [p.lang, p.modified.toISOString()])));
  }
  return byUrl;
}
