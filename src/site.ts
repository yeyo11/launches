// Who the blog belongs to. Shipcast's brand config will own these values; until then they live here.
export const SITE = {
  author: 'José Antonio Garrido',
  github: 'https://github.com/yeyo11',
  devto: 'https://dev.to/yeyo11',
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
