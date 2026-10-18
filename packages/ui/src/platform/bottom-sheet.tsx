import {
	type PointerEvent,
	type ReactNode,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
} from "react";

export interface BottomSheetProps {
	ariaLabel?: string;
	children: ReactNode;
	className?: string;
	description?: string;
	dismissible?: boolean;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	title?: string;
}

export function BottomSheet({
	open,
	onOpenChange,
	children,
	ariaLabel,
	title,
	description,
	dismissible = true,
	className,
}: BottomSheetProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const descriptionId = useId();
	const handleCancel = useCallback(
		(event: SyntheticEvent<HTMLDialogElement, Event>) => {
			if (!dismissible) {
				event.nativeEvent.preventDefault();
				return;
			}
			onOpenChange(false);
		},
		[dismissible, onOpenChange]
	);
	const handlePointerDown = useCallback(
		(event: PointerEvent<HTMLDialogElement>) => {
			if (dismissible && event.target === event.currentTarget) {
				onOpenChange(false);
			}
		},
		[dismissible, onOpenChange]
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			aria-describedby={description ? descriptionId : undefined}
			aria-label={title ? undefined : ariaLabel}
			aria-labelledby={title ? titleId : undefined}
			className={["vf-bottom-sheet", className].filter(Boolean).join(" ")}
			onCancel={handleCancel}
			onPointerDown={handlePointerDown}
			ref={dialogRef}
		>
			{title ? <h2 id={titleId}>{title}</h2> : null}
			{description ? <p id={descriptionId}>{description}</p> : null}
			{children}
		</dialog>
	);
}
