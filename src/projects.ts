// Each project owns one flat colour and one motif for its house illustration. Known projects are
// listed; any other gets a colour and a motif picked from its name, so a new launch never arrives
// without one. Every colour carries black text at AA or better.

export type Motif = 'phone' | 'terminal' | 'label' | 'wave' | 'orb' | 'stack';

export interface ProjectLook {
  colour: string;
  motif: Motif;
}

const KNOWN: Record<string, ProjectLook> = {
  claudio: { colour: '#2FD7A0', motif: 'phone' },
  shipcast: { colour: '#FFD43B', motif: 'label' },
};

const SPARE_COLOURS = ['#FF6FAE', '#FF7A2F', '#7C8CFF', '#FF5A4A'];
const SPARE_MOTIFS: Motif[] = ['wave', 'orb', 'stack', 'terminal'];

function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

const ALL_MOTIFS: Motif[] = ['phone', 'terminal', 'label', 'wave', 'orb', 'stack'];

/** A motif for one article, so a project's launches do not all share the same drawing */
export function motifFor(seed: string): Motif {
  return ALL_MOTIFS[hash(seed) % ALL_MOTIFS.length] ?? 'orb';
}

export function lookOf(project: string): ProjectLook {
  const known = KNOWN[project.toLowerCase()];
  if (known) return known;
  const h = hash(project.toLowerCase());
  return {
    colour: SPARE_COLOURS[h % SPARE_COLOURS.length] ?? '#FF6FAE',
    motif: SPARE_MOTIFS[hash(`${project.toLowerCase()}:motif`) % SPARE_MOTIFS.length] ?? 'orb',
  };
}
