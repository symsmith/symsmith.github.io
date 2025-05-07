import { visit } from "unist-util-visit";

const rehypeAnimate = () => {
	return (tree) => {
		visit(tree, "root", (node) => {
			for (const child of node.children) {
				if ("properties" in child) {
					child.properties.class = [
						...(child.properties.class || "").split(" "),
						"animate",
					]
						.filter(Boolean)
						.join(" ");
				}
			}
		});
	};
};

export default rehypeAnimate;
