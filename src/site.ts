import { parse } from 'yaml';
import brandFile from '../brand.yml?raw';

interface Brand {
  displayName: string;
  github: string;
  handles: Partial<Record<'x' | 'linkedin' | 'bluesky' | 'mastodon' | 'devto' | 'reddit' | 'instagram', string>>;
  support?: string;
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
  },
};

export function formatDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long' }).format(date);
}
