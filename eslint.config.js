import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import astroParser from "astro-eslint-parser";
import astroPlugin from "eslint-plugin-astro";
import eslint from "@eslint/js";
import tsESLint from "typescript-eslint";
import gitignore from "eslint-config-flat-gitignore";

export default defineConfig(
	tsESLint.config([
		gitignore(),
		globalIgnores([".vscode/", "**/public/"]),
		eslint.configs.recommended,
		tsESLint.configs.recommended,
		...astroPlugin.configs.recommended,
		{
			languageOptions: {
				globals: {
					...globals.node,
					...globals.browser,
				},
				sourceType: "module",
			},
			rules: {
				semi: ["error", "always"],
				"@typescript-eslint/triple-slash-reference": "off",
			},
		},
		{
			files: ["**/*.astro"],
			languageOptions: {
				parser: astroParser,
				sourceType: "script",

				parserOptions: {
					parser: "@typescript-eslint/parser",
					extraFileExtensions: [".astro"],
				},
			},
		},
	]),
);
