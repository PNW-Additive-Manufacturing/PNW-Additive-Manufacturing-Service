import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Spinner() {
    return <FontAwesomeIcon icon = {faSpinner} className={`w-full h-full animate-spin fill-inherit`}/>
}
