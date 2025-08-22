import Image from "next/image";

export default function AMSIcon() {
	return (
		<Image
			loading="eager"
			src={"/assets/logo.svg"}
			width={320}
			height={320}
			alt="Logo"
			className="w-28"></Image>
	);
}
