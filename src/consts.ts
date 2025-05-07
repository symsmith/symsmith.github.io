import type { Metadata, Site, Socials } from "~/types";

export const SITE: Site = {
	NAME: "Syméon Smith",
	NUM_POSTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
	TITLE: "Home",
	DESCRIPTION:
		"Short articles about web development topics that I come across in my daily work",
};

export const BLOG: Metadata = {
	TITLE: "Blog",
	DESCRIPTION:
		"Short articles about web development topics that I come across in my daily work",
};

export const SOCIALS: Socials = [
	{
		NAME: "github",
		HREF: "https://github.com/symsmith",
	},
	{
		NAME: "bluesky",
		HREF: "https://bsky.app/profile/symeon.dev",
	},
	{
		NAME: "linkedin",
		HREF: "https://www.linkedin.com/in/symeon-smith/",
	},
	{
		NAME: "me@symeon.dev",
		HREF: "mailto:me@symeon.dev",
	},
];
