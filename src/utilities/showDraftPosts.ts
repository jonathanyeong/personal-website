import type { CollectionEntry } from 'astro:content';

const showDraftPosts = (post: CollectionEntry<"blog">) => {
	return import.meta.env.DEV || !post.data.draft
};

export default showDraftPosts