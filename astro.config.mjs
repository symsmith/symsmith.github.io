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
import rehypeAnimate from "./plugins/animate";
import rehypeCopyCode from "./plugins/copyCode";
import remarkDescription from "./plugins/description";

const { SITE_URL = "http://localhost:4321" } = loadEnv(
	process.env.NODE_ENV,
	process.cwd(),
	"",
);

export default defineConfig({
	site: SITE_URL,
	devToolbar: {
		enabled: false,
	},
	markdown: {
		shikiConfig: {
			transformers: [
				transformerMetaHighlight(),
				transformerRemoveLineBreak(),
				transformerColorizedBrackets(),
			],
			themes: { light: "one-light", dark: "slack-dark" },
		},
		remarkPlugins: [remarkDescription],
		rehypePlugins: [rehypeCopyCode, rehypeAnimate],
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
