/**
 * Email-safe equivalents of the design tokens in packages/ui/src/styles/globals.css.
 * Email clients do not reliably preserve CSS custom properties, so colors are
 * inlined as the same hex values documented alongside the CSS tokens.
 */
const tailwindConfig = {
	theme: {
		extend: {
			colors: {
				background: "#fdfbf7",
				foreground: "#212121",
				card: "#ffffff",
				"card-foreground": "#212121",
				primary: "#004d40",
				"primary-foreground": "#ffffff",
				secondary: "#e65100",
				"secondary-foreground": "#ffffff",
				muted: "#f2f0ec",
				"muted-foreground": "#757472",
				accent: "#a7ffeb",
				"accent-foreground": "#004d40",
				destructive: "#fc3250",
				border: "#e3e1dd",
				input: "#e3e1dd",
				ring: "#004d40",
			},
			fontFamily: {
				sans: ["Lato", "Inter", "Arial", "sans-serif"],
			},
			borderRadius: {
				sm: "5px",
				DEFAULT: "7px",
				md: "7px",
				lg: "13px",
				xl: "20px",
				"2xl": "30px",
			},
		},
	},
};

export default tailwindConfig;
