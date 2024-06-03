import type { CollectionEntry } from 'astro:content';

const isDraftPost = (post: CollectionEntry<"blog">) => {
	return post.data.draft
};

export default isDraftPost;
