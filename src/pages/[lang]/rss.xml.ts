import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import { LOCALES, SITE, STRINGS, type Locale } from '../../site';
import { getPosts, urlOf } from '../../posts';

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

// Feed readers get the whole article: the rendered HTML without Shiki's inline colours and with
// site paths made absolute, since a reader shows it away from the site
function content(html: string, site: URL): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'picture', 'source', 'video']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], source: ['srcset', 'type'], video: ['src', 'controls', 'poster'], code: ['class'], pre: ['class'] },
    transformTags: {
      a: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, ...(attribs.href && { href: new URL(attribs.href, site).href }) } }),
      img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, ...(attribs.src && { src: new URL(attribs.src, site).href }) } }),
    },
  });
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as Locale;
  const site = context.site!;
  const posts = await getPosts(lang);
  const self = new URL(`/${lang}/rss.xml`, site).href;
  return rss({
    title: STRINGS[lang].title,
    description: STRINGS[lang].tagline,
    // The channel links to this language's front page; the items' paths resolve against it
    site: new URL(`/${lang}/`, site).href,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: urlOf(post),
      categories: post.data.tags,
      author: `me@josegarrido.dev (${SITE.author})`,
      content: post.rendered?.html ? content(post.rendered.html, site) : undefined,
    })),
    customData: `<language>${lang}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
  });
}
