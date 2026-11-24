import {
	type LinkComponent,
	type LinkComponentProps,
	Link as TanStackLink,
} from "@tanstack/react-router";

export type LinkProps = LinkComponentProps<"a">;

// Drop-in replacement for TanStack Router's Link that enables view transitions.
// Typed as LinkComponent so `to`, `params`, `search`, etc. stay route-aware.
export const Link: LinkComponent<"a"> = (props) => (
	<TanStackLink viewTransition {...props} />
);
