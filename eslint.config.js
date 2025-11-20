import eslint from "@eslint/js";
import astroParser from "astro-eslint-parser";
import gitignore from "eslint-config-flat-gitignore";
import astroPlugin from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tsESLint from "typescript-eslint";

export default defineConfig([
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
]);
