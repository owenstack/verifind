import { cn } from "@verifind/ui/lib/utils";

export function Logo({
	wordmark,
	className,
}: {
	wordmark?: boolean;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col items-center gap-4", className)}>
			<img
				alt="VeriFind"
				className="size-16 sm:size-20"
				height={240}
				src="/logo.png"
				width={240}
			/>
			{wordmark && (
				<h1 className="font-bold text-5xl leading-none tracking-tight sm:text-6xl">
					VeriFind
				</h1>
			)}
		</div>
	);
}
