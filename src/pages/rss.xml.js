import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { formatInTimeZone } from 'date-fns-tz'
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import filterPublishedPosts from '../utilities/filterPublishedPosts';
const parser = new MarkdownIt();

export async function GET(context) {
	const posts = filterPublishedPosts(await getCollection('blog'));

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
