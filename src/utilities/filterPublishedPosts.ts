import type { CollectionEntry } from 'astro:content';
import isDraftPost from './isDraftPost';
import hasPubDatePassed from './hasPubDatePassed';

const filterPublishedPosts = (allPosts: CollectionEntry<"blog">[]): CollectionEntry<"blog">[] => {
  return allPosts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  ).filter((post) => {
    console.log(`For Post: ${post.data.title} -- is NOT Draft Post ${!isDraftPost(post)} and hasPubDatePassed ${hasPubDatePassed(post)}`)
    return import.meta.env.DEV || !isDraftPost(post) && hasPubDatePassed(post)
  });
}

export default filterPublishedPosts;