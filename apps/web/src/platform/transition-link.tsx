import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

export type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink(props: TransitionLinkProps) {
	return <Link viewTransition {...props} />;
}
