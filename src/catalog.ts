// The projects the site has a page for: every one projects.yml lists, every one with a profile in
// src/content/projects/, and every one an article launched, in either language. Each comes with its
// articles in the page's language, its figures from GitHub and the media its launches brought.
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, type Locale } from './site';
import { getPosts, projectName, type Post } from './posts';
import { listedProjects, lookOf, type ProjectLook } from './projects';
import { repoFigures, type RepoFigures } from './github';
import { projectMedia, type Demo, type Screenshot } from './media';

export interface Project {
  name: string;
  repo: string;
  look: ProjectLook;
  tagline?: string;
  /** "What it is", as paragraphs */
  description: string[];
  site?: string;
  wikidata?: string;
  /** Its articles in this language, newest first */
  posts: Post[];
  /** How many articles it has in any language, so a project launched in one is still listed in both */
  launchCount: number;
  latest?: Post;
  /** The latest release on GitHub, else the newest launch's version */
  version?: string;
  figures: RepoFigures;
  demo?: Demo;
  screenshots: Screenshot[];
  /** Its articles' tags, most used first */
  tags: string[];
}

type Profile = CollectionEntry<'projects'>['data'];

async function profiles(): Promise<Map<string, Profile>> {
  const entries = await getCollection('projects');
  return new Map(entries.map((e) => [e.id.toLowerCase(), e.data]));
}

/** Every project's name, newest launch first, then the ones never launched here by name */
export async function projectNames(): Promise<string[]> {
  const all = await getPosts();
  const launched = [...new Set(all.map((p) => projectName(p.data.repo)?.toLowerCase()).filter((n): n is string => Boolean(n)))];
  const rest = [...new Set([...listedProjects(), ...(await profiles()).keys()])].filter((n) => !launched.includes(n)).sort();
  return [...launched, ...rest];
}

const paragraphs = (text: string | undefined) => (text ?? '').split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

export async function getProject(name: string, lang: Locale): Promise<Project> {
  const all = await getPosts();
  const mine = all.filter((p) => projectName(p.data.repo)?.toLowerCase() === name);
  const posts = mine.filter((p) => p.data.lang === lang);
  const latest = posts[0];
  const profile = (await profiles()).get(name);
  const repo = profile?.repo ?? mine.find((p) => p.data.repo)?.data.repo ?? `${SITE.github}/${name}`;
  const figures = await repoFigures(repo);

  // Each launch folder is named after its ref; the article whose image lives there dates it
  const dated = new Map<string, Date>();
  for (const post of mine) {
    const ref = post.data.image?.match(/^\/launches\/[^/]+\/([^/]+)\//)?.[1] ?? post.data.version;
    if (ref && !dated.has(ref)) dated.set(ref, post.data.pubDate);
  }
  const { demo, screenshots } = projectMedia(name, dated, profile?.demo);

  const counts = new Map<string, number>();
  for (const tag of posts.flatMap((p) => p.data.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const tags = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);

  // GitHub's description is written in English, so the Spanish page never borrows it
  const fromGitHub = lang === 'en' ? figures.description : undefined;
  const description = paragraphs(profile?.description?.[lang]);
  return {
    name,
    repo,
    look: lookOf(name),
    tagline: profile?.tagline?.[lang] ?? fromGitHub ?? latest?.data.description,
    description: description.length > 0 ? description : paragraphs(latest?.data.description ?? fromGitHub),
    site: profile?.site,
    wikidata: profile?.wikidata,
    posts,
    launchCount: mine.length,
    latest,
    version: figures.release ?? mine[0]?.data.version,
    figures,
    demo,
    screenshots,
    tags,
  };
}

export async function getProjects(lang: Locale): Promise<Project[]> {
  return Promise.all((await projectNames()).map((name) => getProject(name, lang)));
}
