"use client";

import useHasViewed from "@/app/hooks/useHasViewed";
import { motion, MotionNodeAnimationOptions, useInView } from "motion/react";
import { useRef } from "react";

export default function DragInOnView({ children, animate, delaySec, direction }: React.PropsWithChildren<{ animate?: MotionNodeAnimationOptions["animate"], direction: "up" | "down" | "left" | "right", delaySec?: number }>) {

    const ref = useRef(null);
    const hasViewed = useHasViewed(ref);

    const amplitudePercent = Math.abs(5);

    const initialY = direction === "up" ? `${amplitudePercent}%` : direction === "down" ? `-${amplitudePercent}%` : "0px";
    const initialX = direction === "left" ? `-${amplitudePercent}%` : direction === "right" ? `${amplitudePercent}%` : "0px";

    return <>

        <motion.div ref={ref} initial={{ y: initialY, x: initialX, opacity: 0 }} animate={hasViewed ? Object.assign(Object.assign({ y: 0, x: 0, opacity: 1 }, animate), delaySec === undefined ? {} : { transition: { delay: delaySec } }) : {}}>

            {children}

        </motion.div>

    </>
}