import AMSIcon from "./components/AMSIcon";
import Error from "./components/Error";
import HorizontalWrap from "./components/HorizontalWrap";
import Image from "next/image";

export default function NotFound() {
	return <Error code={404} details="Requested page is not available" />;
}
