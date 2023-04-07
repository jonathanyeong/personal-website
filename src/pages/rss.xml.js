import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import showDraftPosts from '../utilities/showDraftPosts';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function get(context) {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	).filter((post) => showDraftPosts(post));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/${post.slug}/`,
		})),
		stylesheet: '/rss/styles.xsl',
	});
}
