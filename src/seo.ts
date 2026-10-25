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

/** Home › … › page: every crumb is a page of its own, the last one this page */
export function breadcrumbs(trail: Array<{ name: string; url: URL }>): JsonLdNode {
  const page = trail.at(-1);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${page?.url.href ?? site}#breadcrumbs`,
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: crumb.url.href })),
  };
}

/** An index page (every project, every article) and the ordered list it shows */
export function collectionPage(input: { url: URL; name: string; description: string; lang: Locale; items: Array<{ name: string; url: URL }> }): JsonLdNode {
  return {
    '@type': 'CollectionPage',
    '@id': `${input.url}#page`,
    url: input.url.href,
    name: input.name,
    description: input.description,
    inLanguage: input.lang,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: item.url.href })),
    },
  };
}

/** A project's page: the page itself and the software it is about, joined to its launch articles */
export function softwarePage(input: {
  url: URL;
  name: string;
  description: string;
  lang: Locale;
  repo: string;
  image?: URL;
  version?: string;
  licence?: string;
  language?: string;
  site?: string;
  wikidata?: string;
  articles: URL[];
}): JsonLdNode[] {
  const software = `${input.url}#software`;
  return [
    {
      '@type': 'WebPage',
      '@id': `${input.url}#page`,
      url: input.url.href,
      name: input.name,
      description: input.description,
      inLanguage: input.lang,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': software },
      ...(input.image && { primaryImageOfPage: input.image.href }),
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': software,
      name: input.name,
      description: input.description,
      url: input.url.href,
      codeRepository: input.repo,
      author: { '@id': PERSON_ID },
      ...(input.image && { image: input.image.href }),
      ...(input.version && { version: input.version }),
      // schema.org wants the licence as a URL; SPDX has one for every id GitHub reports
      ...(input.licence && { license: `https://spdx.org/licenses/${input.licence}.html` }),
      ...(input.language && { programmingLanguage: input.language }),
      ...((input.site || input.wikidata) && { sameAs: [input.site, input.wikidata].filter(Boolean) }),
      ...(input.articles.length > 0 && { subjectOf: input.articles.map((url) => ({ '@id': `${url}#article` })) }),
    },
  ];
}
