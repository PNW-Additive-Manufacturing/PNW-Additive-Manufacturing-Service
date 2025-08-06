"use client";

import useHasViewed from "@/app/hooks/useHasViewed";
import { motion, MotionNodeAnimationOptions, useInView } from "motion/react";
import { useRef } from "react";

export default function FadeInOnView({ children, animate, delaySec }: React.PropsWithChildren<{ animate?: MotionNodeAnimationOptions["animate"], delaySec?: number }>) {

    const ref = useRef(null);
    const hasViewed = useHasViewed(ref);

    return <>

        <motion.div ref={ref} initial={{ opacity: 0.05 }} animate={hasViewed ? Object.assign(Object.assign({ opacity: 1 }, animate), delaySec === undefined ? {} : { transition: { delay: delaySec } }) : {}}>

            {children}

        </motion.div>

    </>
}