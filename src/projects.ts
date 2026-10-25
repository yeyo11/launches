// Each project owns one flat colour and one motif for its house illustration. Known projects are
// listed in projects.yml (at the repo root, which Shipcast reads too); any other gets a colour and a
// motif picked from its name, so a new launch never arrives without one. Every colour carries black
// text at AA or better.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export type Motif = 'phone' | 'terminal' | 'label' | 'wave' | 'orb' | 'stack';

export interface ProjectLook {
  colour: string;
  motif: Motif;
  /** A drawn cover, a site path; it replaces the CSS illustration wherever the project appears */
  cover?: string;
}

const ALL_MOTIFS: Motif[] = ['phone', 'terminal', 'label', 'wave', 'orb', 'stack'];

// Read at build time: the file is part of the site's source, not something served
const KNOWN: Record<string, ProjectLook> = (() => {
  const listed = (parse(readFileSync(join(process.cwd(), 'projects.yml'), 'utf8')) ?? {}) as Record<string, ProjectLook>;
  for (const [name, look] of Object.entries(listed)) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(look.colour) || !ALL_MOTIFS.includes(look.motif)) {
      throw new Error(`projects.yml: ${name} needs a #RRGGBB colour and one of ${ALL_MOTIFS.join(', ')}`);
    }
  }
  return listed;
})();

const SPARE_COLOURS = ['#FF6FAE', '#FF7A2F', '#7C8CFF', '#FF5A4A'];
const SPARE_MOTIFS: Motif[] = ['wave', 'orb', 'stack', 'terminal'];

function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/** A motif for one article, so a project's launches do not all share the same drawing */
export function motifFor(seed: string): Motif {
  return ALL_MOTIFS[hash(seed) % ALL_MOTIFS.length] ?? 'orb';
}

/** Every project projects.yml lists, by its lowercase name */
export function listedProjects(): string[] {
  return Object.keys(KNOWN);
}

export function lookOf(project: string): ProjectLook {
  const name = project.toLowerCase();
  const known = Object.hasOwn(KNOWN, name) ? KNOWN[name] : undefined;
  if (known) return known;
  const h = hash(name);
  return {
    colour: SPARE_COLOURS[h % SPARE_COLOURS.length] ?? '#FF6FAE',
    motif: SPARE_MOTIFS[hash(`${name}:motif`) % SPARE_MOTIFS.length] ?? 'orb',
  };
}
