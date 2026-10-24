import { parse } from 'yaml';
import brandFile from '../brand.yml?raw';

interface Brand {
  displayName: string;
  github: string;
  handles: Partial<Record<'x' | 'linkedin' | 'bluesky' | 'mastodon' | 'devto', string>>;
}

// brand.yml is the one place the brand is described, for Shipcast and for this site alike.
const brand = parse(brandFile) as Brand;

export const SITE = {
  author: brand.displayName,
  github: `https://github.com/${brand.github}`,
  profiles: [
    ['GitHub', `https://github.com/${brand.github}`],
    ['dev.to', brand.handles.devto],
    ['Mastodon', brand.handles.mastodon],
    ['Bluesky', brand.handles.bluesky],
    ['LinkedIn', brand.handles.linkedin],
    ['X', brand.handles.x],
  ].filter((p): p is [string, string] => Boolean(p[1])),
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
  },
  es: {
    title: 'Lanzamientos',
    tagline: 'Proyectos de José Antonio Garrido, el día que salen.',
    empty: 'Todavía no se ha lanzado nada. El primer proyecto llegará aquí con su release.',
    readIn: 'Read in English',
    allLaunches: 'Todos los lanzamientos',
    source: 'Código',
    release: 'Release',
  },
};

export function formatDate(date: Date, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long' }).format(date);
}
