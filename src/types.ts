export type Site = {
	NAME: string;
	NUM_POSTS_ON_HOMEPAGE: number;
};

export type Metadata = {
	TITLE: string;
	DESCRIPTION: string;
};

export type Socials = {
	NAME: string;
	HREF: string;
}[];

export type UsesItem = {
	object?: string;
	name?: string;
	link?: string;
	list?: string[];
};

export type UsesCategory = {
	title: string;
	items: UsesItem[];
};
