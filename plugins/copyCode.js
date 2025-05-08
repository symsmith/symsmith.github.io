import { visit } from "unist-util-visit";

const rehypeCopyCode = () => {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName === "pre") {
				// save "pre" element
				const preElement = node;
				// remove "pre" element from tree
				parent.children.splice(index, 1);
				// create copy code button
				const copyCodeButton = {
					type: "element",
					tagName: "button",
					properties: {
						class: "copy-button",
					},
					children: [
						{
							type: "text",
							value: "Copy",
						},
					],
				};
				// create new "div" element with "pre" element inside
				const divElement = {
					type: "element",
					tagName: "div",
					properties: {
						class: "code-container",
					},
					children: [preElement, copyCodeButton],
				};
				// insert div at index
				parent.children.splice(index, 0, divElement);
			}
		});
	};
};

export default rehypeCopyCode;
