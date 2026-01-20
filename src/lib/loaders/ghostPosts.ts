import type { Loader, LoaderContext } from "astro/loaders";
import { ghostClient } from "@lib/api/ghost";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { shikiThemes, shikiDefaultColor } from "../../../shiki.config.mjs";
import { AtpAgent, AppBskyFeedPost } from "@atproto/api";
import { site } from "astro:config/client";
import { parseURL, withoutTrailingSlash } from "ufo";

interface ParsedPost {
  uri: string;
  createdAt: string;
  links: string[]; // URLs found in facets and embeds
}

function extractBskyPostId(codeInjection: string): string | undefined {
  const match = codeInjection.match(
    /<!--\s*METADATA:\s*bskyPostId=([a-zA-Z0-9]+)\s*-->/,
  );
  return match?.[1];
}

export function ghostPostLoader(): Loader {
  return {
    name: "ghostcms-posts",

    load: async ({ store, logger, parseData }: LoaderContext) => {
      try {
        let page = 1;
        let hasMore = true;
        const allPosts = [];

        logger.info("Starting to fetch Ghost posts...");

        while (hasMore) {
          const posts = await ghostClient.posts.browse({
            limit: 100,
            page: page,
            include: ["tags"],
            filter: "tag:-hash-newsletter",
            order: "published_at DESC",
          });

          allPosts.push(...posts);

          const nextPage = posts.meta.pagination.next;
          hasMore = nextPage !== null;
          if (nextPage !== null) {
            page = nextPage;
          }

          logger.info(
            `Fetched page ${posts.meta.pagination.page} of ${posts.meta.pagination.pages}`,
          );
        }
        logger.info(`Loaded ${allPosts.length} posts from Ghost`);

        let cutoffDate = new Date();
        for (const post of allPosts) {
          const publishedAt = post.published_at
            ? new Date(post.published_at)
            : undefined;

          if (publishedAt && cutoffDate > publishedAt) {
            cutoffDate = publishedAt;
          }
        }

        const agent = new AtpAgent({ service: "https://public.api.bsky.app" });
        const feedIterator = createBlueskyFeedIterator(
          agent,
          "jonathanyeong.com",
          cutoffDate,
        );

        logger.info(`Fetching Bluesky Posts with cutoffDate: ${cutoffDate}`);
        while (!feedIterator.isExhausted()) {
          await feedIterator.fetchMore();
        }

        let bskyPostMap = new Map<
          string,
          { createdAt: string; bskyPostId: string }
        >();
        for (const bskyPost of feedIterator.posts) {
          // I'm assuming both the facet and embed will have the same link
          // Hoping that doesn't bite me later
          const { pathname } = parseURL(
            withoutTrailingSlash(bskyPost.links[0]),
          );

          const slug = pathname.split("/").pop();

          if (!slug) {
            logger.warn(`slug for bskypost is undefined: ${bskyPost.links[0]}`);
            continue;
          }
          const post = bskyPostMap.get(slug);
          if (!post || post.createdAt > bskyPost.createdAt) {
            const bskyPostId = bskyPost.uri.split("/").pop();
            if (!bskyPostId) {
              logger.warn(`URI for bskypost is undefined: ${bskyPost.uri}`);
              continue;
            }
            bskyPostMap.set(bskyPost.links[0], {
              createdAt: bskyPost.createdAt,
              bskyPostId,
            });
          }
        }
        logger.info(
          `Loaded bskyPostMap with ${bskyPostMap.size} number of entries`,
        );

        for (const post of allPosts) {
          const id = post.slug;
          let bskyPostId = extractBskyPostId(post.codeinjection_foot || "");
          if (!bskyPostId) {
            const bskyPost = bskyPostMap.get(post.slug);
            logger.info(`post.slug: ${post.slug} bskyPost: ${bskyPost}`);
            if (bskyPost) {
              bskyPostId = bskyPost.bskyPostId;
            }
          }
          // Transformation done here to match the schema of our md blog collection.
          const rawData = {
            title: post.title,
            description: post.custom_excerpt || post.excerpt || "",
            pubDate: post.published_at
              ? new Date(post.published_at)
              : undefined,
            updatedDate: post.updated_at
              ? new Date(post.updated_at)
              : undefined,
            heroImage: post.feature_image || undefined,
            draft: false, // Ghost posts are published by default
            featured: post.featured || false,
            topics: post.tags?.map((tag) => tag.name) || [],
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
              html: await highlightGhostCode(post.html || ""),
            },
          });
        }

        logger.info("Ghost posts loaded successfully");
      } catch (error) {
        logger.error(
          `Ghost loader error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
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
      .use(rehypeShiki, {
        themes: shikiThemes,
        defaultLanguage: "plaintext",
        inline: "tailing-curly-colon",
        defaultColor: shikiDefaultColor,
      })
      .use(rehypeStringify)
      .process(html);

    return String(result);
  } catch (error) {
    return html;
  }
}

function createBlueskyFeedIterator(
  agent: AtpAgent,
  actor: string,
  cutoffDate: Date,
) {
  const posts: ParsedPost[] = [];
  let cursor: string | undefined;
  let exhausted = false;
  let oldestPostDate: Date | null = null;

  async function fetchNextPage(): Promise<boolean> {
    if (exhausted) return false;

    try {
      const { data } = await agent.getAuthorFeed({
        actor,
        limit: 100,
        cursor,
      });

      for (const item of data.feed) {
        // skip reposts
        if (item.reason) continue;

        const post = item.post;
        if (!AppBskyFeedPost.isRecord(post.record)) continue;

        const record = post.record;
        const postDate = new Date(record.createdAt as string);

        if (!oldestPostDate || postDate < oldestPostDate) {
          oldestPostDate = postDate;
        }

        if (postDate < cutoffDate) {
          exhausted = true;
          break;
        }

        const links: string[] = [];

        // Extract links from facets
        const facets = record.facets as
          | Array<{ features: Array<{ uri?: string; $type?: string }> }>
          | undefined;
        if (facets) {
          for (const facet of facets) {
            for (const feature of facet.features) {
              if (
                feature.$type === "app.bsky.richtext.facet#link" &&
                feature.uri
              ) {
                links.push(feature.uri);
              }
            }
          }
        }

        if (post.embed && "external" in post.embed) {
          const external = post.embed.external as { uri?: string };
          if (external.uri) {
            links.push(external.uri);
          }
        }

        if (
          !links.some((link) =>
            link.startsWith(site || "https://jonathanyeong.com"),
          )
        ) {
          continue;
        }
        if (links.length > 0) {
          posts.push({
            uri: post.uri,
            createdAt: record.createdAt as string,
            links,
          });
        }
      }

      cursor = data.cursor;

      if (!cursor) {
        exhausted = true;
      }

      return true;
    } catch {
      exhausted = true;
      return false;
    }
  }

  return {
    posts,
    fetchMore: fetchNextPage,
    getOldestPostDate: () => oldestPostDate,
    /** Check if we've exhausted all pages */
    isExhausted: () => exhausted,
  };
}
