import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './site';

export type Post = CollectionEntry<'posts'>;

/** The glob loader ids posts as `<lang>/<slug>`; the URL keeps only the slug under the language. */
export function slugOf(post: Post): string {
  return post.id.replace(/^(en|es)\//, '');
}

export function urlOf(post: Post): string {
  return `${import.meta.env.BASE_URL}${post.data.lang}/${slugOf(post)}/`;
}

/** Published posts, newest first. Drafts stay out of the build, also in dev, so a preview is honest. */
export async function getPosts(lang?: Locale): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => !p.data.draft && (!lang || p.data.lang === lang));
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** The other language's version of a post, if it was written. */
export function translationOf(post: Post, all: Post[]): Post | undefined {
  return all.find((p) => p.data.translationKey === post.data.translationKey && p.data.lang !== post.data.lang);
}

/** `github.com/yeyo11/claudio` → `claudio` */
export function projectName(repo: string | undefined): string | undefined {
  if (!repo) return undefined;
  return new URL(repo).pathname.split('/').filter(Boolean).at(-1) ?? repo;
}
