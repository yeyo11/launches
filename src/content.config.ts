import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per article and language: src/content/posts/<lang>/<slug>.md. Shipcast writes
// them in the drafts pull request; merging it is what publishes them.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(['en', 'es']),
    // The same key on the English and Spanish versions links them as translations
    translationKey: z.string(),
    // The launched project and the release that triggered the article
    // A launch's project; an article written in Shipcast's app belongs to none
    repo: z.url().optional(),
    version: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // The launch image Shipcast renders into public/launches/<project>/<ref>/, for og:image
    image: z.string().startsWith('/').optional(),
    // What the launch image shows, for og:image:alt; without it, the title
    imageAlt: z.string().optional(),
    // A drawn cover for this article; without it, the project's cover or the CSS illustration
    cover: z.string().startsWith('/').optional(),
    // What the cover shows, when it says more than the headline beside it; without it, decorative
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// What each project's page says about it, in both languages: one YAML file per project at
// src/content/projects/<name>.yml, the name being the repo's. Its look (colour, motif, cover) stays in
// projects.yml, which Shipcast also reads and validates strictly, so the page's copy lives here
// instead and a field added for the site can never make a launch fail. Every field is optional: a
// project without a file gets its words from GitHub and its latest article.
const bilingual = z.object({ en: z.string().optional(), es: z.string().optional() });
const projects = defineCollection({
  loader: glob({ pattern: '*.{yml,yaml}', base: './src/content/projects' }),
  schema: z.object({
    /** One line, the card's: what it is in a sentence */
    tagline: bilingual.optional(),
    /** A paragraph or two for "What it is"; blank lines split paragraphs */
    description: bilingual.optional(),
    /** The repository, when no article names it or it is not github.com/<author>/<name> */
    repo: z.url().optional(),
    /** The project's own website or documentation */
    site: z.url().optional(),
    /** A video or GIF of it in use, a site path; without it, the newest one a launch brought */
    demo: z.string().startsWith('/').optional(),
    /** Its Wikidata item, so search engines join the page to the entity */
    wikidata: z.url().optional(),
  }),
});

export const collections = { posts, projects };
