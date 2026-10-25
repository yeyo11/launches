// Each article as Markdown, for AI assistants and anyone who wants the source: the front matter's
// facts as a header, then the body exactly as written, with site paths made absolute.
import { SITE, type Locale } from './site';
import { projectName, slugOf, urlOf, type Post } from './posts';

const absolute = (markdown: string, site: URL) => markdown.replace(/(\]\(|src=")\/(?!\/)/g, `$1${site.origin}/`);

export function markdownPath(post: Post): string {
  return `${import.meta.env.BASE_URL}${post.data.lang}/${slugOf(post)}.md`;
}

export function articleMarkdown(post: Post, site: URL, translation?: Post): string {
  const url = new URL(urlOf(post), site).href;
  const facts = [
    `- URL: ${url}`,
    `- Author: ${SITE.author}`,
    `- Published: ${post.data.pubDate.toISOString().slice(0, 10)}`,
    post.data.updatedDate && `- Updated: ${post.data.updatedDate.toISOString().slice(0, 10)}`,
    `- Language: ${post.data.lang}`,
    post.data.repo && `- Project: [${projectName(post.data.repo)}](${post.data.repo})${post.data.version ? ` ${post.data.version}` : ''}`,
    post.data.tags.length > 0 && `- Tags: ${post.data.tags.join(', ')}`,
    translation && `- ${translation.data.lang === 'es' ? 'Spanish' : 'English'} version: ${new URL(urlOf(translation), site).href}`,
  ].filter(Boolean);
  return `# ${post.data.title}\n\n> ${post.data.description}\n\n${facts.join('\n')}\n\n${absolute(post.body ?? '', site).trim()}\n`;
}

export const LANGUAGE_NAME: Record<Locale, string> = { en: 'English', es: 'Español' };

/** Every heading one level down, leaving code blocks (where `#` is a comment) untouched */
export function demoteHeadings(markdown: string): string {
  let fence: string | undefined;
  return markdown
    .split('\n')
    .map((line) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (marker && (!fence || marker.startsWith(fence))) fence = fence ? undefined : marker;
      return !fence && !marker && /^#{1,5} /.test(line) ? `#${line}` : line;
    })
    .join('\n');
}
