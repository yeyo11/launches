// A project's figures from GitHub's public API, read once per build: stars, the latest release and
// the licence. Without a token GitHub allows 60 requests an hour per address, and a CI runner shares
// its address with strangers, so every failure (rate limit, network, timeout, a repo that is not on
// GitHub) leaves the figures out instead of failing the build: a page without its star count is
// better than no deploy. GITHUB_TOKEN, when the environment has one, only raises that limit.

export interface RepoFigures {
  stars?: number;
  /** The latest release's tag, e.g. v0.9.0 */
  release?: string;
  releasedAt?: Date;
  /** The SPDX id, e.g. MIT */
  licence?: string;
  language?: string;
  topics?: string[];
  description?: string;
}

const API = 'https://api.github.com';
// Both languages render every project page: one request per repo and endpoint, shared
const cache = new Map<string, Promise<unknown>>();

async function get(path: string): Promise<unknown> {
  const known = cache.get(path);
  if (known) return known;
  const token = process.env.GITHUB_TOKEN;
  const request = fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'josegarrido.dev build',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    signal: AbortSignal.timeout(8000),
  })
    .then((response) => (response.ok ? response.json() : undefined))
    .catch(() => undefined);
  cache.set(path, request);
  return request;
}

/** `https://github.com/owner/name` → `owner/name`; anything not on github.com has no figures */
export function githubSlug(repo: string): string | undefined {
  try {
    const url = new URL(repo);
    if (url.hostname !== 'github.com') return undefined;
    const [owner, name] = url.pathname.split('/').filter(Boolean);
    return owner && name ? `${owner}/${name.replace(/\.git$/, '')}` : undefined;
  } catch {
    return undefined;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export async function repoFigures(repo: string): Promise<RepoFigures> {
  const slug = githubSlug(repo);
  // Lets a build with no network (or an impatient local preview) skip the calls entirely
  if (!slug || process.env.SKIP_GITHUB === '1') return {};
  const [info, release] = await Promise.all([get(`/repos/${slug}`), get(`/repos/${slug}/releases/latest`)]);
  const figures: RepoFigures = {};
  if (isRecord(info)) {
    if (typeof info.stargazers_count === 'number') figures.stars = info.stargazers_count;
    const licence = isRecord(info.license) ? info.license.spdx_id : undefined;
    // GitHub answers NOASSERTION for a licence it cannot name
    if (typeof licence === 'string' && licence !== 'NOASSERTION') figures.licence = licence;
    if (typeof info.language === 'string') figures.language = info.language;
    if (Array.isArray(info.topics)) figures.topics = info.topics.filter((t): t is string => typeof t === 'string');
    if (typeof info.description === 'string' && info.description) figures.description = info.description;
  }
  if (isRecord(release) && typeof release.tag_name === 'string') {
    figures.release = release.tag_name;
    if (typeof release.published_at === 'string') figures.releasedAt = new Date(release.published_at);
  }
  return figures;
}
