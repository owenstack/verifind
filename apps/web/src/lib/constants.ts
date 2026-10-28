import {
	Building2,
	DoorClosed,
	Heart,
	Home,
	HousePlus,
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

interface OnboardingOptions {
	description?: string;
	icon?: LucideIcon;
	title: string;
	value: string;
}

interface OnboardingForm {
	bedroom: OnboardingOptions[];
	paymentType: OnboardingOptions[];
	propType: OnboardingOptions[];
}

interface BudgetPlan {
	default: number;
	max: number;
	min: number;
	period: "month" | "year";
}

export interface LGA {
	country_code: string;
	country_id: number;
	country_name: string;
	id: number;
	latitude: number;
	longitude: number;
	name: string;
	state_code: string;
	state_id: number;
	state_name: string;
}

export type PaymentType = "standard" | "financing";

// Budget scale depends on the payment plan, since financed rent is paid
// monthly and standard rent is paid yearly. Values are stored in kobo.
export const budgetLimits: Record<PaymentType, BudgetPlan> = {
	financing: {
		default: 30_000_000,
		max: 100_000_000,
		min: 10_000_000,
		period: "month",
	},
	standard: {
		default: 100_000_000,
		max: 1_000_000_000,
		min: 70_000_000,
		period: "year",
	},
};

export const footerLinks: NavLink[] = [
	{ to: "/", icon: Home, label: "Home" },
	{ to: "/search", icon: Search, label: "Search" },
	{ to: "/saved", icon: Heart, label: "Saved" },
	{ to: "/chat", icon: MessageCircle, label: "Messages" },
	{ to: "/user", icon: User, label: "Profile" },
];

export const onboarding: OnboardingForm = {
	propType: [
		{
			value: "single",
			title: "Single Room",
			description: "A single room or self-contained unit",
			icon: DoorClosed,
		},
		{
			value: "apartment",
			title: "Apartment",
			description: "A mini-flat or an apartment with 1–3 bedrooms",
			icon: HousePlus,
		},
		{
			value: "house",
			title: "Whole House or Bungalow",
			description: "Duplex or bungalow",
			icon: Building2,
		},
	],
	bedroom: [
		{ value: "1", title: "1" },
		{ value: "2", title: "2" },
		{ value: "3", title: "3" },
		{ value: "4+", title: "4+" },
	],
	paymentType: [
		{
			value: "standard",
			title: "Standard – Annually",
			description: "Pay rent yearly",
		},
		{
			value: "financing",
			title: "Rent Financing",
			description: "Monthly, subject to eligibility",
		},
	],
};
