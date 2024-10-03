import Image from "next/image";

export default function AMSIcon() {
	return (
		<Image
			src={"/assets/logo.svg"}
			width={720}
			height={720}
			alt="Logo"
			className="w-28 mb-4"></Image>
	);
}
