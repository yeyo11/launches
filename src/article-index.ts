// The article index's pages: every article in a language, the same narrowed to one project or one
// topic, each cut into pages. Filtering is a set of static pages (links that work without
// JavaScript and that a crawler can follow), since a static site cannot read a query string.
import { articlesPath, topicSlug, type IndexFilter, type Locale } from './site';
import { getPosts, projectName, type Post } from './posts';

export const PAGE_SIZE = 20;

export interface IndexView {
  filter?: IndexFilter;
  /** What the filter shows: the project's name, or the tag as written */
  label?: string;
  posts: Post[];
  page: number;
  pages: number;
  total: number;
  /** Every project and topic in this language, for the filter bar */
  projects: string[];
  topics: Array<{ tag: string; count: number }>;
  /** The same view in the other language, when it has one */
  alternate?: string;
}

interface Group {
  filter?: IndexFilter;
  label?: string;
  posts: Post[];
}

function groups(posts: Post[]): Group[] {
  const byProject = new Map<string, Post[]>();
  const byTopic = new Map<string, { tag: string; posts: Post[] }>();
  for (const post of posts) {
    const project = projectName(post.data.repo)?.toLowerCase();
    if (project) byProject.set(project, [...(byProject.get(project) ?? []), post]);
    for (const tag of post.data.tags) {
      const slug = topicSlug(tag);
      const known = byTopic.get(slug) ?? { tag, posts: [] };
      if (!known.posts.includes(post)) known.posts.push(post);
      byTopic.set(slug, known);
    }
  }
  return [
    { posts },
    ...[...byProject].map(([value, list]) => ({ filter: { kind: 'project', value } as const, label: value, posts: list })),
    ...[...byTopic].map(([value, { tag, posts: list }]) => ({ filter: { kind: 'topic', value } as const, label: tag, posts: list })),
  ];
}

const key = (filter?: IndexFilter) => (filter ? `${filter.kind}:${filter.value}` : '');

export async function indexViews(lang: Locale): Promise<IndexView[]> {
  const other: Locale = lang === 'en' ? 'es' : 'en';
  const posts = await getPosts(lang);
  const mine = groups(posts);
  const theirs = new Map(groups(await getPosts(other)).map((g) => [key(g.filter), Math.max(1, Math.ceil(g.posts.length / PAGE_SIZE))]));
  const projects = mine.filter((g) => g.filter?.kind === 'project').map((g) => g.filter!.value);
  const topics = mine
    .filter((g) => g.filter?.kind === 'topic')
    .map((g) => ({ tag: g.label ?? '', count: g.posts.length }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return mine.flatMap((group) => {
    const pages = Math.max(1, Math.ceil(group.posts.length / PAGE_SIZE));
    const otherPages = theirs.get(key(group.filter));
    return Array.from({ length: pages }, (_, i) => ({
      ...group,
      posts: group.posts.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
      page: i + 1,
      pages,
      total: group.posts.length,
      projects,
      topics,
      // The other language's index always exists; a filter or a page there only when it has articles
      alternate: !group.filter && i === 0 ? articlesPath(other) : otherPages && otherPages > i ? articlesPath(other, group.filter, i + 1) : undefined,
    }));
  });
}

/** The route parameter of a view: its path under the index, none for the first page of everything */
export function viewParam(lang: Locale, view: IndexView): string | undefined {
  const path = articlesPath(lang, view.filter, view.page).slice(articlesPath(lang).length).replace(/\/$/, '');
  return path || undefined;
}
