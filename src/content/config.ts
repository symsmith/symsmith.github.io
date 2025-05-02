import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		date: z.coerce.date().transform((date) => {
			const tzo = date.getTimezoneOffset();
			date.setHours(12 - tzo / 60, 0, 0, 0);
			return date;
		}),
		draft: z.boolean().optional(),
	}),
});

export const collections = { blog };
