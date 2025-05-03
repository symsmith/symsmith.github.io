import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { HOME } from "~/consts";
import { getDescription } from "~/lib/utils";

type Context = {
	site: string;
};

export async function GET(context: Context) {
	const blog = await getCollection("blog");

	const items = blog.toSorted(
		(a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
	);

	const awaitedItems = await Promise.all(
		items.map(async (item) => ({
			title: item.data.title,
			description: await getDescription(item),
			pubDate: item.data.date,
			link: `/${item.collection}/${item.slug}/`,
		})),
	);

	return rss({
		title: HOME.TITLE,
		description: HOME.DESCRIPTION,
		site: context.site,
		items: awaitedItems,
	});
}
