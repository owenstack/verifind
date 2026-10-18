import { readFileSync, writeFileSync } from "node:fs";

const logo = readFileSync("public/logo.png");
const encodedLogo = logo.toString("base64");
const monochromeIcon = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
	<title>VeriFind monochrome app icon</title>
	<mask id="mark">
		<image height="512" href="data:image/png;base64,${encodedLogo}" preserveAspectRatio="xMidYMid meet" width="512" />
	</mask>
	<rect fill="#000" height="512" mask="url(#mark)" width="512" />
</svg>
`;

writeFileSync("public/monochrome-icon.svg", monochromeIcon);
