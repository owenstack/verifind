import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Tailwind,
	Text,
} from "react-email";
import tailwindConfig from "./tailwind.config";

export interface SignInOTPEmailProps {
	email?: string;
	otp?: string;
}

export const SignInOTPEmail = ({ email, otp }: SignInOTPEmailProps) => {
	const previewText = `Your Sign in OTP is ${otp}`;

	return (
		<Html>
			<Head />
			<Tailwind config={tailwindConfig}>
				<Preview>{previewText}</Preview>
				<Body className="bg-background px-4 py-12 font-sans text-foreground">
					<Container className="mx-auto max-w-120 rounded-xl border border-border bg-card p-8">
						<Text className="mt-0 mb-2 font-semibold text-primary text-xs uppercase tracking-[0.18em]">
							VeriFind
						</Text>
						<Heading className="mt-0 mb-3 font-semibold text-2xl text-foreground leading-tight tracking-tight">
							Your sign-in code
						</Heading>
						<Text className="mt-0 mb-6 text-base text-muted-foreground leading-7">
							Enter this one-time code to sign in
							{email ? ` to ${email}` : " to your account"}.
						</Text>
						<Text className="my-0 rounded-lg border border-border bg-muted px-4 py-5 text-center font-mono font-semibold text-3xl text-foreground tracking-[0.35em]">
							{otp}
						</Text>
						<Text className="mt-6 mb-0 text-muted-foreground text-sm leading-6">
							This code can only be used once. Never share it with anyone. If
							you didn’t request a sign-in code, you can safely ignore this
							email.
						</Text>
					</Container>
					<Text className="mx-auto mt-6 max-w-120 text-center text-muted-foreground text-xs leading-5">
						This is an automated message from VeriFind. Please don’t reply to
						this email.
					</Text>
				</Body>
			</Tailwind>
		</Html>
	);
};

SignInOTPEmail.PreviewProps = {
	email: "test@example.com",
	otp: "123456",
};

export default SignInOTPEmail;
