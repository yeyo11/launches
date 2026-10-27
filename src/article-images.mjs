// An article's screenshots and charts live in public/articles/<slug>/ (Shipcast's contract), so
// Markdown renders them as plain <img> tags that the browser fetches all at once, competing with the
// fonts the headline and the dek wait for: a post with six screenshots missed Lighthouse's LCP budget
// on a phone. Every body image is deferred until it nears the viewport, and gets its file's real width
// and height so the page does not shift when it arrives.
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = new URL('../public/', import.meta.url);

/**
 * A Sätteri hast plugin for the articles' Markdown
 * @type {NonNullable<import('@astrojs/markdown-satteri').SatteriProcessorOptions['hastPlugins']>[number]}
 */
export const articleImages = {
  name: 'article-images',
  element: {
    filter: ['img'],
    async visit(node, ctx) {
      const properties = node.properties ?? {};
      if (!('loading' in properties)) ctx.setProperty(node, 'loading', 'lazy');
      if (!('decoding' in properties)) ctx.setProperty(node, 'decoding', 'async');
      const src = properties.src;
      if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//') || 'width' in properties) return;
      const { width, height } = await sharp(fileURLToPath(new URL(decodeURI(src.slice(1)), PUBLIC))).metadata();
      if (!width || !height) return;
      ctx.setProperty(node, 'width', width);
      ctx.setProperty(node, 'height', height);
    },
  },
};
