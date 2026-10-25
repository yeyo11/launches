// The two choices the Worker makes from request headers, kept free of Workers APIs so they can be
// tested with node --test.

export type Lang = 'en' | 'es';

interface Weighted {
  value: string;
  q: number;
  order: number;
}

/** `a;q=0.5, b` → entries with their q (1 when absent), highest first, ties in written order */
function weighted(header: string | null): Weighted[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part, order) => {
      const [value = '', ...params] = part.trim().split(';');
      const q = params.map((p) => /^\s*q=([0-9.]+)\s*$/i.exec(p)?.[1]).find(Boolean);
      return { value: value.trim().toLowerCase(), q: q === undefined ? 1 : Number(q), order };
    })
    .filter((e) => e.value && Number.isFinite(e.q) && e.q > 0)
    .sort((a, b) => b.q - a.q || a.order - b.order);
}

/**
 * The language of the bare domain: the reader's own choice on the site (the `lang` cookie) if any,
 * else the first language of Accept-Language the site has (any `es*` is Spanish), else English,
 * which is also what a crawler without Accept-Language gets.
 */
export function chooseLanguage(cookie: string | null, acceptLanguage: string | null): Lang {
  const chosen = /(?:^|;\s*)lang=(en|es)(?:;|$)/.exec(cookie ?? '')?.[1];
  if (chosen === 'en' || chosen === 'es') return chosen;
  for (const { value } of weighted(acceptLanguage)) {
    const primary = value.split('-')[0];
    if (primary === 'es' || primary === 'en') return primary;
  }
  return 'en';
}

/** Whether Accept asks for Markdown at least as much as for HTML (`text/markdown` named outright) */
export function prefersMarkdown(accept: string | null): boolean {
  const entries = weighted(accept);
  const q = (type: string) => entries.find((e) => e.value === type)?.q;
  const markdown = q('text/markdown');
  if (markdown === undefined) return false;
  const html = q('text/html') ?? Math.max(q('text/*') ?? 0, q('*/*') ?? 0);
  return markdown >= html;
}
