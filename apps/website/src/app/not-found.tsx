import AMSIcon from "./components/AMSIcon";
import ErrorPrompt from "./components/ErrorPrompt";
import HorizontalWrap from "./components/HorizontalWrap";
import Image from "next/image";

export default function NotFound() {
	return (
		<ErrorPrompt code={"404"} details="Requested page is not available" />
	);
}
