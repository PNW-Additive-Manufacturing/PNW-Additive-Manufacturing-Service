"use client";

import { Suspense } from "react";
// https://francoisbest.com/posts/2023/displaying-local-times-in-nextjs

import { formatTime } from "../api/util/Constants";
import { useHydration } from "../hooks/useHydration";
import * as UTCSchedule from "./Schedule";
import { withDate } from "../utils/TimeUtils";

// Re-export for convenience .
export const weekdays = UTCSchedule.weekdays;

export const currentDate = new Date();
export const currentDay = currentDate.getDay();

export const weeklySchedule = UTCSchedule.weeklyScheduleUTC.map(d => d == null ? null : {
    open: new Date(d.open),
    close: new Date(d.close)
});

export const currentDaySchedule = weeklySchedule[currentDay];

// console.log(currentDate, withDate(currentDaySchedule!.open, currentDate), currentDaySchedule!.close);

export const isOpen = currentDaySchedule != null && currentDate > withDate(weeklySchedule[currentDay]!.open, currentDate) && currentDate < withDate(weeklySchedule[currentDay]!.close, currentDate);
export const closingTime = weeklySchedule[currentDay] == null ? null : weeklySchedule[currentDay]?.close!;

export function AvailabilityText() {
    const hydrated = useHydration();

    return <Suspense key={hydrated ? "local" : "utc"}>
        <div className="w-fit max-md:pl-2 py-3 text-sm tracking-wider mb-5">
            {isOpen ? <>We are available for pickup until {formatTime(closingTime!)}: </> : <>We are currently closed: </>}
            <a
                href={"/schedule"}
                className="underline">
                View our Schedule
            </a>
        </div>
    </Suspense>
} 