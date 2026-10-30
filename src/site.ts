import { parse } from 'yaml';
import brandFile from '../brand.yml?raw';
import { umamiConfig } from './umami.mjs';

interface Brand {
  displayName: string;
  github: string;
  handles: Partial<Record<'x' | 'linkedin' | 'bluesky' | 'mastodon' | 'devto' | 'reddit' | 'instagram', string>>;
  support?: string;
  analytics?: { cloudflareWebAnalytics?: string };
  newsletter?: { forms?: Partial<Record<'en' | 'es', string>> };
}

// brand.yml is the one place the brand is described, for Shipcast and for this site alike.
const brand = parse(brandFile) as Brand;

export const SITE = {
  author: brand.displayName,
  github: `https://github.com/${brand.github}`,
  handle: brand.github,
  profiles: [
    ['GitHub', `https://github.com/${brand.github}`],
    ['dev.to', brand.handles.devto],
    ['Mastodon', brand.handles.mastodon],
    ['Bluesky', brand.handles.bluesky],
    ['Instagram', brand.handles.instagram],
    ['Reddit', brand.handles.reddit],
    ['LinkedIn', brand.handles.linkedin],
    ['X', brand.handles.x],
  ].filter((p): p is [string, string] => Boolean(p[1])),
  support: brand.support,
  analyticsToken: brand.analytics?.cloudflareWebAnalytics,
  /** Umami, from the build's environment (not brand.yml): undefined until the owner sets it */
  umami: umamiConfig({
    UMAMI_SCRIPT_URL: import.meta.env.UMAMI_SCRIPT_URL,
    UMAMI_WEBSITE_ID: import.meta.env.UMAMI_WEBSITE_ID,
    UMAMI_HOST_URL: import.meta.env.UMAMI_HOST_URL,
  }),
  /** Where each language's subscription form posts: a Brevo form with double opt-in */
  newsletterForms: brand.newsletter?.forms ?? {},
};

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/** Each page's path in each language, in that language's words (Google advises it); never change a published one */
const PAGES = {
  about: { en: 'about', es: 'sobre-mi' },
  privacy: { en: 'privacy', es: 'privacidad' },
  subscribed: { en: 'subscribed', es: 'suscrito' },
  projects: { en: 'projects', es: 'proyectos' },
  articles: { en: 'articles', es: 'articulos' },
} as const;

/** The first segment of every page above, in both languages: no article may take one as its slug */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set(Object.values(PAGES).flatMap((p) => [p.en, p.es]));

export function pagePath(page: keyof typeof PAGES, lang: Locale): string {
  return `${import.meta.env.BASE_URL}${lang}/${PAGES[page][lang]}/`;
}

/** A project's own page: the name is the repo's, the same in both languages */
export function projectPath(project: string, lang: Locale): string {
  return `${pagePath('projects', lang)}${project}/`;
}

/** The words of the article index's sub-paths, translated like the pages */
const INDEX_WORDS = {
  project: { en: 'project', es: 'proyecto' },
  topic: { en: 'topic', es: 'tema' },
  page: { en: 'page', es: 'pagina' },
} as const;
export type IndexFilter = { kind: 'project' | 'topic'; value: string };

/** The article index, optionally narrowed to one project or one topic, at a page past the first */
export function articlesPath(lang: Locale, filter?: IndexFilter, page = 1): string {
  const parts = [
    ...(filter ? [INDEX_WORDS[filter.kind][lang], filter.kind === 'topic' ? topicSlug(filter.value) : filter.value] : []),
    ...(page > 1 ? [INDEX_WORDS.page[lang], String(page)] : []),
  ];
  return `${pagePath('articles', lang)}${parts.map((p) => `${p}/`).join('')}`;
}

/** A tag as a path segment: tags are written freely in the front matter, a URL is not */
export function topicSlug(tag: string): string {
  return tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'topic';
}

/** The sub-path words of articlesPath, for the routes that build those pages */
export function indexWord(word: keyof typeof INDEX_WORDS, lang: Locale): string {
  return INDEX_WORDS[word][lang];
}

export const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    title: 'Launches',
    tagline: 'Open-source tools I build, told the day they ship.',
    empty: "Nothing has shipped yet. Subscribe and I'll let you know about the first one.",
    readIn: 'Leer en español',
    allLaunches: 'All launches',
    source: 'Source',
    release: 'Release',
    support: 'Buy me a coffee',
    toDay: 'Light theme',
    toNight: 'Dark theme',
    privacy: 'Privacy',
    home: 'Home',
    skip: 'Skip to content',
    intro:
      "I'm José, a full-stack developer. I build tools for developers, mostly in TypeScript, and this is where I tell you about each one: what it solves and how to try it.",
    codeOn: 'The code is on GitHub as',
    recent: 'Recent launches',
    more: 'More launches',
    workshop: 'The workshop',
    workshopNote: "What I've built and keep maintaining.",
    nextProject: "The next one is on its way.",
    launchCount: 'launches',
    oneLaunch: 'launch',
    bandTitle: 'I build the tools I need, then I ship them.',
    follow: 'Follow on GitHub',
    readMore: 'More from the workshop',
    about: 'About',
    aboutLink: 'More about me',
    nlTitle: 'Every launch, in your inbox',
    nlNote: "I write when I ship an open-source project: what it does and how to try it. No spam.",
    nlLabel: 'Your email',
    nlPlaceholder: 'you@email.com',
    nlButton: 'Subscribe',
    nlSending: 'Sending…',
    nlDone: 'Almost there: check your inbox and confirm your email.',
    nlInvalid: "That doesn't look like an email address. Please check it and try again.",
    nlError: 'Something went wrong. Please try again in a moment.',
    nlLegal: 'Sent through Brevo; leave with one click.',
    subscribedTitle: "You're in.",
    subscribedNote: "Your email is confirmed. I'll write when the next project ships.",
    backToLaunches: 'Back to the launches',
    projects: 'Projects',
    projectsNote: 'Every tool I have built and launched here, with its story release by release.',
    articles: 'Articles',
    articlesNote: 'Everything I have written, newest first.',
    overview: 'Overview',
    launches: 'Launches',
    whatItIs: 'What it is',
    demo: 'Demo',
    screenshots: 'Screenshots',
    latestLaunch: 'Latest launch',
    details: 'Details',
    repository: 'Repository',
    version: 'Version',
    released: 'Released',
    licence: 'Licence',
    language: 'Language',
    stars: 'Stars',
    star: 'star',
    starsLower: 'stars',
    website: 'Website',
    topics: 'Topics',
    viewSource: 'View on GitHub',
    readLaunch: 'Read the launch',
    noLaunches: 'No launches in English yet.',
    otherLanguage: 'See it in Spanish',
    allProjects: 'All projects',
    project: 'Project',
    topic: 'Topic',
    all: 'All',
    filterBy: 'Filter the articles',
    newer: 'Newer',
    older: 'Older',
    pageOf: 'Page {n} of {total}',
    articleCount: 'articles',
    oneArticle: 'article',
    articlesAbout: 'Articles about {x}',
    sections: 'Sections',
    breadcrumbs: 'Breadcrumbs',
    openProject: 'Open the project',
    demoLabel: 'A recording of {x} in use',
    screenshotOf: '{x}: {page}',
    sinceLaunch: 'first launched',
  },
  es: {
    title: 'Lanzamientos',
    tagline: 'Herramientas open source que construyo, contadas el día que salen.',
    empty: 'Todavía no ha salido nada. Suscríbete y te aviso del primero.',
    readIn: 'Read in English',
    allLaunches: 'Todos los lanzamientos',
    source: 'Código',
    release: 'Release',
    support: 'Invítame a un café',
    toDay: 'Tema claro',
    toNight: 'Tema oscuro',
    privacy: 'Privacidad',
    home: 'Inicio',
    skip: 'Saltar al contenido',
    intro:
      'Soy José, desarrollador full-stack. Construyo herramientas para desarrolladores, casi siempre en TypeScript, y aquí te cuento cada una: qué resuelve y cómo probarla.',
    codeOn: 'El código está en GitHub como',
    recent: 'Últimos lanzamientos',
    more: 'Más lanzamientos',
    workshop: 'El taller',
    workshopNote: 'Lo que he construido y sigo manteniendo.',
    nextProject: 'El siguiente está en camino.',
    launchCount: 'lanzamientos',
    oneLaunch: 'lanzamiento',
    bandTitle: 'Construyo las herramientas que necesito y luego las lanzo.',
    follow: 'Sígueme en GitHub',
    readMore: 'Más del taller',
    about: 'Sobre mí',
    aboutLink: 'Más sobre mí',
    nlTitle: 'Cada lanzamiento, en tu correo',
    nlNote: 'Te escribo cuando publico un proyecto open source: qué hace y cómo probarlo. Sin spam.',
    nlLabel: 'Tu email',
    nlPlaceholder: 'tu@email.com',
    nlButton: 'Suscribirme',
    nlSending: 'Enviando…',
    nlDone: 'Casi listo: revisa tu correo y confirma tu email.',
    nlInvalid: 'Eso no parece un email. Revísalo e inténtalo de nuevo.',
    nlError: 'Algo ha fallado. Inténtalo de nuevo en un momento.',
    nlLegal: 'Se envía con Brevo; te das de baja con un clic.',
    subscribedTitle: 'Ya estás dentro.',
    subscribedNote: 'Tu email está confirmado. Te escribiré cuando salga el próximo proyecto.',
    backToLaunches: 'Volver a los lanzamientos',
    projects: 'Proyectos',
    projectsNote: 'Todas las herramientas que he construido y lanzado aquí, con su historia release a release.',
    articles: 'Artículos',
    articlesNote: 'Todo lo que he escrito, de lo más nuevo a lo más antiguo.',
    overview: 'Resumen',
    launches: 'Lanzamientos',
    whatItIs: 'Qué es',
    demo: 'Demo',
    screenshots: 'Capturas',
    latestLaunch: 'Último lanzamiento',
    details: 'Detalles',
    repository: 'Repositorio',
    version: 'Versión',
    released: 'Publicada',
    licence: 'Licencia',
    language: 'Lenguaje',
    stars: 'Estrellas',
    star: 'estrella',
    starsLower: 'estrellas',
    website: 'Web',
    topics: 'Temas',
    viewSource: 'Ver en GitHub',
    readLaunch: 'Leer el lanzamiento',
    noLaunches: 'Todavía no hay lanzamientos en español.',
    otherLanguage: 'Verlo en inglés',
    allProjects: 'Todos los proyectos',
    project: 'Proyecto',
    topic: 'Tema',
    all: 'Todos',
    filterBy: 'Filtrar los artículos',
    newer: 'Más recientes',
    older: 'Más antiguos',
    pageOf: 'Página {n} de {total}',
    articleCount: 'artículos',
    oneArticle: 'artículo',
    articlesAbout: 'Artículos sobre {x}',
    sections: 'Secciones',
    breadcrumbs: 'Ruta de navegación',
    openProject: 'Abrir el proyecto',
    demoLabel: 'Una grabación de {x} en uso',
    screenshotOf: '{x}: {page}',
    sinceLaunch: 'primer lanzamiento',
  },
};

export function formatDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long' }).format(date);
}
