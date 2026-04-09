import { ChangeEvent, forwardRef, InputHTMLAttributes, useCallback, useImperativeHandle, useRef } from "react";

export interface InvisibleFileInputProps
    extends Pick<InputHTMLAttributes<HTMLInputElement>, "multiple" | "accept"> {
    onChange: (files: FileList) => void;
}

export interface InvisibleFileInputHandle {
    enter: () => void;
}

const InvisibleFileInput = forwardRef<InvisibleFileInputHandle, InvisibleFileInputProps>((props, ref) => {

    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
        enter: () => inputRef.current?.click()
    }));

    const onChangeCallback = useCallback((ev: ChangeEvent<HTMLInputElement>) => {

        const files = ev.currentTarget.files;
        if (files && files.length > 0) props.onChange(files);

    }, [props]);

    return <>
    
    <input
            ref={inputRef}
            className="hidden"
            type="file"
            multiple={props.multiple}
            accept={props.accept}
            onChange={onChangeCallback}
        />
    
    </>
});

export default InvisibleFileInput;
