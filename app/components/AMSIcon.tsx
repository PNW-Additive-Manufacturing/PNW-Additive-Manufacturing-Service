import Image from "next/image";
import { amImageIconLightTransparent } from "../Branding";

export default function AMSIcon() {
	return (
		<Image
			loading="eager"
			src={amImageIconLightTransparent}
			alt="Logo"
			className="w-28 h-fit"></Image>
	);
}
