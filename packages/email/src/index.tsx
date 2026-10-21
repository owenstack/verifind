import { render } from "react-email";
import { Resend } from "resend";
import { SignInOTPEmail, type SignInOTPEmailProps } from "./sign-in-otp";

export async function sendSignInOTPEmail({
	apiKey,
	props,
}: {
	apiKey: string;
	props: Required<SignInOTPEmailProps>;
}) {
	const resend = new Resend(apiKey);
	return await resend.emails.send({
		from: "Support <no-reply@mail.efobi.dev>",
		to: props.email,
		subject: `Your Sign in OTP is ${props.otp}`,
		html: await render(<SignInOTPEmail {...props} />),
	});
}
