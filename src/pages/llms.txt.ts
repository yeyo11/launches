// The site's map for language models (https://llmstxt.org): who writes it, what it is about, and
// every article in each language with a link to its Markdown.
import type { APIContext } from 'astro';
import { LOCALES, SITE, STRINGS, pagePath } from '../site';
import { getPosts } from '../posts';
import { LANGUAGE_NAME, markdownPath } from '../markdown';

export async function GET({ site }: APIContext) {
  const abs = (path: string) => new URL(path, site).href;
  const sections = await Promise.all(
    LOCALES.map(async (lang) => {
      const posts = await getPosts(lang);
      const lines = posts.map((p) => `- [${p.data.title}](${abs(markdownPath(p))}): ${p.data.description}`);
      return `## ${STRINGS[lang].title} (${LANGUAGE_NAME[lang]})\n\n${lines.length > 0 ? lines.join('\n') : '- None yet.'}`;
    }),
  );
  const body = `# ${SITE.author}

> ${STRINGS.en.tagline} ${SITE.author}'s blog, in English and Spanish: each article announces an open-source developer tool the day it ships, written from the project's code, with what it solves and how to try it.

Every article is linked here as Markdown; the HTML page is the same URL without \`.md\`, with a trailing slash. The full text of every article is in [llms-full.txt](${abs('/llms-full.txt')}).

${sections.join('\n\n')}

## About

- [About the author](${abs(pagePath('about', 'en'))}): who writes this blog, the projects and the stack
- [GitHub](${SITE.github}): the code of every project announced here
- [RSS (English)](${abs('/en/rss.xml')}), [RSS (Español)](${abs('/es/rss.xml')}): every article in full

## Optional

- [Privacy policy](${abs(pagePath('privacy', 'en'))})
- [Sitemap](${abs('/sitemap-index.xml')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
