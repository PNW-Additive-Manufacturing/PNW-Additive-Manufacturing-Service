"use client";

import { Suspense } from "react";
// https://francoisbest.com/posts/2023/displaying-local-times-in-nextjs

import { formatTime } from "../api/util/Constants";
import { useHydration } from "../hooks/useHydration";
import * as UTCSchedule from "./Schedule";

// Re-export for convenience .
export const weekdays = UTCSchedule.weekdays;

export const weeklySchedule = UTCSchedule.weeklyScheduleUTC.map(d => d == null ? null : {
    open: new Date(d.open),
    close: new Date(d.close)
})

export const currentTime = new Date();
export const currentDay = currentTime.getDay();

export const isOpen = weeklySchedule[currentDay] != null && currentTime > weeklySchedule[currentDay]!.open && currentTime < weeklySchedule[currentDay]!.close;
export const closingTime = weeklySchedule[currentDay] == null ? null : weeklySchedule[currentDay]?.close!;

export function AvailabilityText() {
    const hydrated = useHydration();

    return <Suspense key={hydrated ? "local" : "utc"}>
        <div className="w-fit max-md:pl-2 py-3 text-xs tracking-wider mb-5">
            {isOpen ? <>We are available for pickup until {formatTime(closingTime!)}: </> : <>We are currently closed: </>}
            <a
                href={"/schedule"}
                className="underline">
                View our Schedule
            </a>
        </div>
    </Suspense>
} 