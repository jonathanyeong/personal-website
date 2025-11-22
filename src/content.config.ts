import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ghostPostLoader } from '@lib/loaders/ghostPosts';

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		updatedDate: z
			.string()
			.or(z.date())
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		heroImage: z.string().optional(),
		draft: z.boolean().default(false),
		featured: z.boolean(),
		topics: z
			.array(z.string())
			.optional()
			.default([]),
		bskyPostId: z.string().optional()
	}),
});

const ghostCmsPosts = defineCollection({
  loader: ghostPostLoader(),
	schema: z.object({
    slug: z.string(),
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		updatedDate: z
			.string()
			.or(z.date())
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		heroImage: z.string().optional(),
		draft: z.boolean().default(false),
		featured: z.boolean(),
		topics: z
			.array(z.string())
			.optional()
			.default([]),
		bskyPostId: z.string().optional(),
    readingTime: z.number().optional()
	}),
});


export const collections = { blog, ghostCmsPosts };
