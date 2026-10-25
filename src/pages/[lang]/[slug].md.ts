import type { APIContext } from 'astro';
import { getPosts, slugOf, translationOf, type Post } from '../../posts';
import { articleMarkdown } from '../../markdown';

export async function getStaticPaths() {
  const all = await getPosts();
  return all.map((post) => ({ params: { lang: post.data.lang, slug: slugOf(post) }, props: { post, translation: translationOf(post, all) } }));
}

export function GET({ props, site }: APIContext<{ post: Post; translation?: Post }>) {
  return new Response(articleMarkdown(props.post, site!, props.translation), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
