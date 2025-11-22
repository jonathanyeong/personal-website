import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import filterPublishedPosts from './filterPublishedPosts';

export type BlogPost = CollectionEntry<'blog'> | CollectionEntry<'ghostCmsPosts'>;

export default async function getAllPosts(): Promise<BlogPost[]> {
  const blogPosts = filterPublishedPosts(await getCollection('blog'));
  const ghostPosts = await getCollection('ghostCmsPosts');

  return [...blogPosts, ...ghostPosts];
}
