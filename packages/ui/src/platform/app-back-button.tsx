import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

export interface AppBackButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
	children: ReactNode;
	onBack: MouseEventHandler<HTMLButtonElement>;
}

export function AppBackButton({
	children,
	onBack,
	...buttonProps
}: AppBackButtonProps) {
	return (
		<button {...buttonProps} onClick={onBack} type="button">
			{children}
		</button>
	);
}
