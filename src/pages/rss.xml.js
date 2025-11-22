import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import getAllPosts from '../utilities/getAllPosts';
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
	const posts = await getAllPosts();

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => {
			const slug = post.collection === 'ghostCmsPosts' ? post.data.slug : post.id;

			let content;
			if (post.collection === 'ghostCmsPosts') {
				content = post.rendered?.html || '';
			} else {
				content = sanitizeHtml(parser.render(post.body || ''));
			}

			return {
				link: `/writing/${slug}/`,
				content: content + RSS_ONLY_MESSAGE,
				...post.data,
			};
		}),
		stylesheet: '/rss/styles.xsl',
	});
}
