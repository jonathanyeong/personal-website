import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import showDraftPosts from '../utilities/showDraftPosts';
import showScheduledPosts from '../utilities/showScheduledPosts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context) {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	).filter((post) => showDraftPosts(post) && showScheduledPosts(post));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			link: `/${post.slug}/`,
			content: sanitizeHtml(parser.render(post.body)),
			...post.data,
		})),
		stylesheet: '/rss/styles.xsl',
	});
}
