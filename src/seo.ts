// Structured data for search engines and AI assistants: one JSON-LD @graph per page, in which the
// author and the site are declared once and every other node points to them by @id.
import { SITE, type Locale } from './site';

export type JsonLdNode = Record<string, unknown>;

// astro.config's `site`, without its trailing slash
const site = import.meta.env.SITE.replace(/\/$/, '');
export const PERSON_ID = `${site}/#person`;
export const WEBSITE_ID = `${site}/#website`;

export function person(): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.author,
    url: `${site}/`,
    image: `${site}/author.jpg`,
    jobTitle: 'Full-stack developer',
    // The Wikidata item is what tells this José Antonio Garrido apart from the namesakes in Google's
    // Knowledge Graph; it is not a profile to show, so it lives here and not in SITE.profiles
    sameAs: [...SITE.profiles.map(([, url]) => url), 'https://www.wikidata.org/wiki/Q141856101'],
  };
}

export function website(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site}/`,
    // Google's site name: the name the results show above the URL, and what else people call it
    name: SITE.author,
    alternateName: ['josegarrido.dev', 'Jose Garrido'],
    inLanguage: ['en', 'es'],
    publisher: { '@id': PERSON_ID },
  };
}

/** The whole graph, as text safe to put inside a <script> element */
export function graph(nodes: JsonLdNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [person(), website(), ...nodes] }).replace(/</g, '\\u003c');
}

export function blogPosting(input: {
  url: URL;
  title: string;
  description: string;
  image: URL;
  published: Date;
  modified: Date;
  lang: Locale;
  tags: string[];
  repo?: string;
  project?: string;
  version?: string;
}): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    '@id': `${input.url}#article`,
    url: input.url.href,
    headline: input.title,
    description: input.description,
    image: input.image.href,
    datePublished: input.published.toISOString(),
    dateModified: input.modified.toISOString(),
    inLanguage: input.lang,
    mainEntityOfPage: input.url.href,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    ...(input.tags.length > 0 && { keywords: input.tags.join(', ') }),
    ...(input.repo && {
      about: {
        '@type': 'SoftwareSourceCode',
        name: input.project,
        codeRepository: input.repo,
        ...(input.version && { version: input.version }),
        author: { '@id': PERSON_ID },
      },
    }),
  };
}

export function profilePage(url: URL, lang: Locale, name: string): JsonLdNode {
  return {
    '@type': 'ProfilePage',
    '@id': `${url}#page`,
    url: url.href,
    name,
    inLanguage: lang,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
  };
}

/** Home › page, for an article or a standalone page */
export function breadcrumbs(home: { name: string; url: URL }, page: { name: string; url: URL }): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${page.url}#breadcrumbs`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: home.name, item: home.url.href },
      { '@type': 'ListItem', position: 2, name: page.name, item: page.url.href },
    ],
  };
}
