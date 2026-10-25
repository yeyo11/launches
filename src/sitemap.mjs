// What the sitemap says about each URL beyond its address: its translations (hreflang, x-default to
// English) and when it last changed, from the articles' own dates, never the build time. Read
// straight from the files because astro.config runs before content collections exist.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const PAGES = [
  { en: '/en/about/', es: '/es/sobre-mi/' },
  { en: '/en/privacy/', es: '/es/privacidad/' },
];
// The same words as pagePath in src/site.ts, which astro.config cannot import
const PROJECTS = { en: '/en/projects/', es: '/es/proyectos/' };
const ARTICLES = { en: '/en/articles/', es: '/es/articulos/' };

/** The article index's filtered views, kept out of search and so out of the sitemap */
export const FILTERED_INDEX = /\/(en\/articles\/(project|topic)|es\/articulos\/(proyecto|tema))\//;

/** @param {string} site */
export function sitemapDetails(site) {
  const dir = join(process.cwd(), 'src/content/posts');
  /** @type {Array<{ lang: 'en' | 'es', path: string, key: string, modified: Date, project?: string }>} */
  const posts = [];
  for (const lang of ['en', 'es']) {
    for (const file of readdirSync(join(dir, lang)).filter((f) => f.endsWith('.md'))) {
      const front = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(dir, lang, file), 'utf8'))?.[1];
      const data = front ? parse(front) : {};
      if (data.draft) continue;
      const project = data.repo ? new URL(data.repo).pathname.split('/').filter(Boolean).at(-1)?.toLowerCase() : undefined;
      posts.push({ lang, path: `/${lang}/${file.replace(/\.md$/, '')}/`, key: data.translationKey, modified: new Date(data.updatedDate ?? data.pubDate), project });
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
  const newest = (lang, project) =>
    posts.filter((p) => p.lang === lang && (!project || p.project === project)).map((p) => p.modified).sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString();
  const byLang = (project) => ({ en: newest('en', project), es: newest('es', project) });
  pair({ en: '/en/', es: '/es/' }, byLang());
  for (const page of PAGES) pair(page);
  pair(PROJECTS, byLang());
  pair(ARTICLES, byLang());
  // The same projects as src/catalog.ts: listed in projects.yml, profiled, or launched
  const listed = Object.keys(parse(readFileSync(join(process.cwd(), 'projects.yml'), 'utf8')) ?? {});
  const profiles = join(process.cwd(), 'src/content/projects');
  const profiled = existsSync(profiles) ? readdirSync(profiles).filter((f) => /\.ya?ml$/.test(f)).map((f) => f.replace(/\.ya?ml$/, '')) : [];
  const launched = posts.map((p) => p.project).filter(Boolean);
  for (const project of new Set([...listed, ...profiled, ...launched].map((n) => n.toLowerCase()))) {
    pair({ en: `${PROJECTS.en}${project}/`, es: `${PROJECTS.es}${project}/` }, byLang(project));
  }
  for (const post of posts) {
    const versions = Object.fromEntries(posts.filter((p) => p.key === post.key).map((p) => [p.lang, p.path]));
    pair(versions, Object.fromEntries(posts.filter((p) => p.key === post.key).map((p) => [p.lang, p.modified.toISOString()])));
  }
  return byUrl;
}
