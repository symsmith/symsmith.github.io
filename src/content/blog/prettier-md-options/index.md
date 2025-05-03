---
title: Custom Prettier Options for Markdown Code Blocks
date: 2025/05/03
---

A Prettier feature that I love is that it formats files, but also code blocks in Markdown files. I wanted to customize the maximum line length for the code in my articles, but not have the same option applied to the rest of my codebase.

There is a Prettier config option that is perfect for this: [`overrides`](https://prettier.io/docs/configuration#configuration-overrides). I can decide, for `.md` files, to apply some formatting options that will be used to format the code blocks (with supported Prettier languages) in my document.

```json
// .prettierrc
{
	"overrides": [
		{
			"files": ["*.md", "*.mdx"],
			"options": {
				// any prettier option
				"printWidth": 65
			}
		}
	]
}
```
