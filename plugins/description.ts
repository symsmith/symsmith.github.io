import type { Paragraph, PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import { EXIT, visit } from "unist-util-visit";

function getNodeValue(node: Paragraph | PhrasingContent): string {
	if (node.type === "paragraph") {
		return node.children.map((child) => getNodeValue(child)).join("");
	} else if ("value" in node) {
		return node.value;
	} else {
		return "";
	}
}

const remarkDescription: Plugin<[], Root> = () => {
	return (tree, file) => {
		visit(tree, "paragraph", (node) => {
			if (file.data.astro?.frontmatter) {
				file.data.astro.frontmatter.description = getNodeValue(node);
			}
			return EXIT;
		});
	};
};

export default remarkDescription;
