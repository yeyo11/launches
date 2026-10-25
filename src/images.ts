import type { ImageMetadata } from 'astro';

// Shipcast's contract keeps covers at public/covers/<project>.jpg and an article's media under
// public/articles/<slug>/, where Instagram and the other channels fetch them by URL, so the files
// stay in public/. The site imports the same files at build time so Astro can serve them resized,
// as AVIF and WebP, with their real width and height; the public copy is untouched. A launch's
// screenshots (public/launches/<project>/<ref>/screenshots/) are shown on the project's page.
const FILES = import.meta.glob<ImageMetadata>(['/public/{covers,articles}/**/*.{jpg,jpeg,png,webp,avif}', '/public/launches/*/*/screenshots/*.{jpg,jpeg,png,webp}', '/public/author.jpg'], {
  eager: true,
  import: 'default',
});

/** The build-time image for a site path (`/covers/claudio.jpg`), when it is one Astro can process */
export function publicImage(path: string): ImageMetadata | undefined {
  return FILES[`/public/${path.replace(/^\//, '')}`];
}

/** One set of widths for every use, so the variants of a cover are generated once and shared */
export const WIDTHS = [320, 480, 640, 800, 1200, 1600];
