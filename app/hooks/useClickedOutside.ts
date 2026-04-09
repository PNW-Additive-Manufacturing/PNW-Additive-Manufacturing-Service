import { useEffect } from "react";

export default function useClickedOutside<T extends Element>(elementRef: React.RefObject<T>, onClickedOutside: () => void, ...additionalDeps: any[]) {

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {

            const isEventOnElement = elementRef.current && elementRef.current.contains(event.target as Node)

            if (elementRef.current && !isEventOnElement) onClickedOutside();

        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    }, [elementRef, onClickedOutside, ...additionalDeps]);

}