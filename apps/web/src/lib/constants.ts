import {
	Heart,
	Home,
	type LucideIcon,
	MessageCircle,
	Search,
	User,
} from "lucide-react";

interface NavLink {
	icon: LucideIcon;
	label: string;
	to: `/${string}`;
}

export const footerLinks: NavLink[] = [
	{ to: "/", icon: Home, label: "Home" },
	{ to: "/search", icon: Search, label: "Search" },
	{ to: "/saved", icon: Heart, label: "Saved" },
	{ to: "/chat", icon: MessageCircle, label: "Messages" },
	{ to: "/user", icon: User, label: "Profile" },
];
