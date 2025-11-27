import type { Loader, LoaderContext } from 'astro/loaders';
import { ghostClient } from '@lib/api/ghost';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypePrettyCode, { type Theme } from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { shikiThemes } from '../../../shiki.config.mjs';

function extractBskyPostId(codeInjection: string): string | undefined {
  const match = codeInjection.match(/<!--\s*METADATA:\s*bskyPostId=([a-zA-Z0-9]+)\s*-->/);
  return match?.[1];
}

export function ghostPostLoader(): Loader {
  return {
    name: 'ghostcms-posts',

    load: async ({ store, logger, parseData }: LoaderContext) => {
      try {
        let page = 1;
        let hasMore = true;
        const allPosts = [];

        logger.info('Starting to fetch Ghost posts...');

        while (hasMore) {
          const posts = await ghostClient.posts.browse({
            limit: 100,
            page: page,
            include: ['tags']
          });

          allPosts.push(...posts);

          const nextPage = posts.meta.pagination.next;
          hasMore = nextPage !== null;
          if (nextPage !== null) {
            page = nextPage;
          }

          logger.info(`Fetched page ${posts.meta.pagination.page} of ${posts.meta.pagination.pages}`);
        }

        logger.info(`Loaded ${allPosts.length} posts from Ghost`);


        for (const post of allPosts) {
          const id = post.slug
          const bskyPostId = extractBskyPostId(post.codeinjection_foot || '');
          // Transformation done here to match the schema of our md blog collection.
          const rawData = {
            title: post.title,
            description: post.custom_excerpt || post.excerpt || '',
            pubDate: post.published_at ?  new Date(post.published_at): undefined,
            updatedDate: post.updated_at ? new Date(post.updated_at) : undefined,
            heroImage: post.feature_image || undefined,
            draft: false, // Ghost posts are published by default
            featured: post.featured || false,
            topics: post.tags?.map(tag => tag.name) || [],
            readingTime: post.reading_time,
            bskyPostId,
          };

          const parsedData = await parseData({
            id,
            data: rawData,
          });

          store.set({
            id,
            data: parsedData,
            rendered: {
              html: await highlightGhostCode(post.html || ''),
            },
          });
        }

        logger.info('Ghost posts loaded successfully');
      } catch (error) {
        logger.error(`Ghost loader error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    },
  };
}

/**
 * Processes Ghost HTML content to apply Shiki syntax highlighting to code blocks and inline code.
 *
 * @param html - The raw HTML content from Ghost
 * @returns HTML with Shiki-highlighted code blocks and inline code
 */
async function highlightGhostCode(html: string): Promise<string> {
  if (!html) return html;

  try {
    const result = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypePrettyCode, {
        theme: shikiThemes as Record<string, Theme>,
        keepBackground: true,
        defaultLang: 'plaintext',
      })
      .use(rehypeStringify)
      .process(html);

    return String(result);
  } catch (error) {
    return html;
  }
}
