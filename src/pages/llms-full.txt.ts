// Every article in full, as Markdown, in one file: the llms.txt map with the text behind each link.
import type { APIContext } from 'astro';
import { LOCALES, SITE, STRINGS } from '../site';
import { getPosts, translationOf } from '../posts';
import { LANGUAGE_NAME, articleMarkdown, demoteHeadings } from '../markdown';

export async function GET({ site }: APIContext) {
  const all = await getPosts();
  const sections = LOCALES.map((lang) => {
    const posts = all.filter((p) => p.data.lang === lang);
    // Each article's own H1 goes one level down, under its language
    const articles = posts.map((p) => demoteHeadings(articleMarkdown(p, site!, translationOf(p, all))));
    return `## ${STRINGS[lang].title} (${LANGUAGE_NAME[lang]})\n\n${articles.join('\n---\n\n')}`;
  });
  const body = `# ${SITE.author}\n\n> ${STRINGS.en.tagline} Every article of ${new URL('/', site).href}, in full, in English and Spanish.\n\n${sections.join('\n\n')}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
