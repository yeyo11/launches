import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { LOCALES, STRINGS, type Locale } from '../../site';
import { getPosts, urlOf } from '../../posts';

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as Locale;
  const posts = await getPosts(lang);
  return rss({
    title: STRINGS[lang].title,
    description: STRINGS[lang].tagline,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: urlOf(post),
    })),
    customData: `<language>${lang}</language>`,
  });
}
