import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import {
	transformerMetaHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { SITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

export default defineConfig({
	site: SITE_URL,
	markdown: {
		shikiConfig: {
			wrap: true,
			transformers: [
				transformerMetaHighlight(),
				transformerRemoveLineBreak(),
				transformerColorizedBrackets(),
			],
			themes: { light: "one-light", dark: "slack-dark" },
		},
	},
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				const url = new URL(page);
				return !url.pathname.includes("drafts");
			},
		}),
		tailwind(),
	],
	trailingSlash: "always",
});
