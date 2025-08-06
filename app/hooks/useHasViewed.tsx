import { useInView } from "motion/react";
import { RefObject, useMemo, useState } from "react";

export default function useHasViewed(ref: RefObject<Element | null>) {
    const isInView = useInView(ref);
    const [hasViewed, setHasViewed] = useState(false);

    if (isInView && !hasViewed) {
        setHasViewed(true);
    }
    return hasViewed;
}