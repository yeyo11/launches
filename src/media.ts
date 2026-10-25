// A project's demo and screenshots, found where Shipcast writes a launch's media:
// public/launches/<project>/<ref>/demo.{mp4,webm,gif} and .../screenshots/<page>-<viewport>.png.
// The Instagram pieces beside them are slides made for that feed, not pictures of the product, so
// they are left out. Read from the files at build time; nothing here moves or rewrites them.
import { existsSync, openSync, readSync, closeSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface Demo {
  /** A site path */
  src: string;
  kind: 'video' | 'image';
  /** Read from the file, so the page reserves the right box before it loads */
  width?: number;
  height?: number;
}

export interface Screenshot {
  src: string;
  /** The captured page, from the file name: `home-desktop.png` → `home` */
  page: string;
}

const PUBLIC = join(process.cwd(), 'public');
const DEMOS = ['demo.mp4', 'demo.webm', 'demo.gif'];

function head(file: string, bytes: number): Buffer {
  const fd = openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(Math.min(bytes, statSync(file).size));
    readSync(fd, buffer, 0, buffer.length, 0);
    return buffer;
  } finally {
    closeSync(fd);
  }
}

/** The pixel size of an MP4 (its first video track's `tkhd`) or a GIF; undefined when unsure */
export function mediaSize(file: string): { width: number; height: number } | undefined {
  if (file.endsWith('.gif')) {
    const data = head(file, 10);
    return data.length === 10 ? { width: data.readUInt16LE(6), height: data.readUInt16LE(8) } : undefined;
  }
  if (!file.endsWith('.mp4')) return undefined;
  // The moov box is usually near the start, or at the end without faststart: a whole read of a
  // short demo is cheap at build time
  const data = head(file, 64 * 1024 * 1024);
  for (let at = data.indexOf('tkhd'); at > 3; at = data.indexOf('tkhd', at + 4)) {
    const size = data.readUInt32BE(at - 4);
    const end = at - 4 + size;
    if (size < 84 || end > data.length) continue;
    // A track header ends with its width and height in 16.16 fixed point; an audio track has 0
    const width = data.readUInt32BE(end - 8) / 65536;
    const height = data.readUInt32BE(end - 4) / 65536;
    if (width > 0 && height > 0) return { width: Math.round(width), height: Math.round(height) };
  }
  return undefined;
}

/** The launch folders of a project, newest first by the date of the article that launched each */
function refsOf(project: string, dated: Map<string, Date>): string[] {
  const dir = join(PUBLIC, 'launches', project);
  if (!existsSync(dir)) return [];
  const refs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const time = (ref: string) => dated.get(ref)?.getTime() ?? 0;
  return refs.sort((a, b) => time(b) - time(a) || b.localeCompare(a, 'en', { numeric: true }));
}

/** `dated`: each launch ref (the folder under public/launches/<project>/) and when it was published */
export function projectMedia(project: string, dated: Map<string, Date>, own?: string): { demo?: Demo; screenshots: Screenshot[] } {
  const refs = refsOf(project, dated);
  const site = (...parts: string[]) => `/${['launches', project, ...parts].join('/')}`;

  let demo: Demo | undefined;
  if (own) {
    const file = join(PUBLIC, own);
    demo = { src: own, kind: /\.(mp4|webm)$/.test(own) ? 'video' : 'image', ...(existsSync(file) && mediaSize(file)) };
  }
  for (const ref of refs) {
    if (demo) break;
    const name = DEMOS.find((d) => existsSync(join(PUBLIC, 'launches', project, ref, d)));
    if (name) demo = { src: site(ref, name), kind: name.endsWith('.gif') ? 'image' : 'video', ...mediaSize(join(PUBLIC, 'launches', project, ref, name)) };
  }

  // The desktop captures read best on a page this wide; a launch with only phone captures shows those
  let screenshots: Screenshot[] = [];
  for (const ref of refs) {
    const dir = join(PUBLIC, 'launches', project, ref, 'screenshots');
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/.test(f)).sort();
    const desktop = files.filter((f) => /-desktop\.\w+$/.test(f));
    screenshots = (desktop.length > 0 ? desktop : files).map((f) => ({ src: site(ref, 'screenshots', f), page: f.replace(/(-(desktop|mobile))?\.\w+$/, '') }));
    if (screenshots.length > 0) break;
  }
  return { demo, screenshots };
}
