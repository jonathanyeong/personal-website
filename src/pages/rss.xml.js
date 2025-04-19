import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import filterPublishedPosts from '../utilities/filterPublishedPosts';
const parser = new MarkdownIt();

const RSS_ONLY_MESSAGE = `
<div>
	<hr />
	<p>
		Thanks for subscribing to my RSS feed! If you have any thoughts or feedback on this post, send me an
		<a href="mailto:hey@jonathanyeong.com">email</a> or DM me on <a href="https://bsky.app/profile/jonathanyeong.com" rel="noopener noreferrer" target="_blank">Bluesky</a>.
	</p>
</div>
`;

export async function GET(context) {
	const posts = filterPublishedPosts(await getCollection('blog'));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			link: `/${post.slug}/`,
			content: sanitizeHtml(parser.render(post.body)) + RSS_ONLY_MESSAGE,
			...post.data,
		})),
		stylesheet: '/rss/styles.xsl',
	});
}
