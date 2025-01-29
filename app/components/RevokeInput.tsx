import { RegularFlag } from "lineicons-react";
import { useRef, useState } from "react";
import { LabelWithIcon } from "./LabelWithIcon";

type RevokeInputProps = {
    onRevokeCallback: (reason: string) => void;
    placeholder: string;
    buttonContent: string;
};

export default function RevokeInput({ onRevokeCallback, placeholder, buttonContent }: RevokeInputProps) {
    const [showInput, setShowInput] = useState(false);
    const content = useRef<null | string>(null);

    return showInput ? <div className="bg-gray-200 p-4 rounded-md">

        <LabelWithIcon icon={<RegularFlag></RegularFlag>}>Revoking</LabelWithIcon>

        <form action={(data) => onRevokeCallback(data.get("content") as string)}>
            <textarea name="content" required={true} placeholder={placeholder} className="mb-2" onChange={(ev) => content.current = ev.currentTarget.textContent}></textarea>
            <button disabled={content.current == null} className="mb-0 text-xs text-left font-normal px-3 py-2">{buttonContent}</button>
        </form>

    </div> : <div
        className="opacity-50 hover:opacity-100 text-sm text-gray-700 fill-gray-700 font-light hover:cursor-pointer"
        onClick={() => setShowInput(true)}
    >
        <LabelWithIcon icon={<RegularFlag></RegularFlag>}>Revoke</LabelWithIcon>
    </div>
}

