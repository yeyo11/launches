import { parse } from 'yaml';
import brandFile from '../brand.yml?raw';

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
  /** Where each language's subscription form posts: a Brevo form with double opt-in */
  newsletterForms: brand.newsletter?.forms ?? {},
};

export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    title: 'Launches',
    tagline: 'Projects by José Antonio Garrido, the day they ship.',
    empty: 'Nothing has launched yet. The first project lands here with its release.',
    readIn: 'Leer en español',
    allLaunches: 'All launches',
    source: 'Source',
    release: 'Release',
    support: 'Buy me a coffee',
    toDay: 'Light theme',
    toNight: 'Dark theme',
    privacy: 'Privacy',
    home: 'Home',
    intro:
      'I build open-source tools for developers. Each one is announced here the day it ships, in English and Spanish: the problem it solves, the commands to try it, and what does not work yet.',
    codeOn: 'The code is on GitHub as',
    recent: 'Recent launches',
    more: 'More launches',
    workshop: 'The workshop',
    workshopNote: 'The tools I build and keep running. Each one has its own colour.',
    nextProject: 'The next project lands here with its first release.',
    launchCount: 'launches',
    oneLaunch: 'launch',
    bandTitle: 'I build the tools I need, then I ship them.',
    follow: 'Follow on GitHub',
    subscribe: 'Subscribe by RSS',
    readMore: 'More from the workshop',
    nlTitle: 'Every launch, in your inbox',
    nlNote: "I write when I ship an open-source project: what it does, how to try it, and what doesn't work yet. No spam.",
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
  },
  es: {
    title: 'Lanzamientos',
    tagline: 'Proyectos de José Antonio Garrido, el día que salen.',
    empty: 'Todavía no se ha lanzado nada. El primer proyecto llegará aquí con su release.',
    readIn: 'Read in English',
    allLaunches: 'Todos los lanzamientos',
    source: 'Código',
    release: 'Release',
    support: 'Invítame a un café',
    toDay: 'Tema claro',
    toNight: 'Tema oscuro',
    privacy: 'Privacidad',
    home: 'Inicio',
    intro:
      'Hago herramientas de código abierto para desarrolladores. Cada una se anuncia aquí el día que sale, en español y en inglés: el problema que resuelve, los comandos para probarla y lo que todavía no funciona.',
    codeOn: 'El código está en GitHub como',
    recent: 'Últimos lanzamientos',
    more: 'Más lanzamientos',
    workshop: 'El taller',
    workshopNote: 'Las herramientas que construyo y mantengo. Cada una tiene su color.',
    nextProject: 'El próximo proyecto llegará aquí con su primera release.',
    launchCount: 'lanzamientos',
    oneLaunch: 'lanzamiento',
    bandTitle: 'Construyo las herramientas que necesito y luego las lanzo.',
    follow: 'Sígueme en GitHub',
    subscribe: 'Suscríbete por RSS',
    readMore: 'Más del taller',
    nlTitle: 'Cada lanzamiento, en tu correo',
    nlNote: 'Te escribo cuando publico un proyecto open source: qué hace, cómo probarlo y qué no funciona todavía. Sin spam.',
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
  },
};

export function formatDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long' }).format(date);
}
