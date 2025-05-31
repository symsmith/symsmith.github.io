import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import {
	transformerMetaHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import rehypeCopyCode from "./plugins/copyCode";
import remarkDescription from "./plugins/description";
import tailwindcss from "@tailwindcss/vite";

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
		rehypePlugins: [rehypeCopyCode],
	},
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				const url = new URL(page);
				return !url.pathname.includes("drafts");
			},
		}),
	],
	trailingSlash: "always",
	vite: {
		plugins: [tailwindcss()],
	},
});
