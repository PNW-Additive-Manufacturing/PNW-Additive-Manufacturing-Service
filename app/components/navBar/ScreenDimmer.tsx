
import { DetailedHTMLProps, HTMLAttributes } from "react";

export function ScreenDimmer(props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
        <div
            className="absolute top-0 left-0 w-full h-screen bg-black bg-opacity-40 xl:hidden"
            {...props}
        />
    );
}