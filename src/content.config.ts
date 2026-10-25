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
    // A drawn cover for this article; without it, the project's cover or the CSS illustration
    cover: z.string().startsWith('/').optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
