import Image from "next/image";

export default function AMSIcon() {
	return (
		<Image
			src={"/assets/logo.svg"}
			width={480}
			height={480}
			style={{ aspectRatio: "1 / 1" }}
			alt="Logo"
			className="w-28"></Image>
	);
}
