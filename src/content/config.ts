import { defineCollection, z } from 'astro:content';
// TEST CHANGE 1
const blog = defineCollection({
	// Type-check frontmatter using a schema
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
			.default([])
	}),
});

export const collections = { blog };
