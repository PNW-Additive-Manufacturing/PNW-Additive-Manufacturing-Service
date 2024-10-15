export type WeeklySchedule = ({
    open: number;
    close: number;
} | null)[];

// Hard-coded schedule. Could be adapted in the future.
export const weeklyScheduleUTC: WeeklySchedule = [
    // Sunday
    null,
    // Monday
    {
        open: Date.UTC(0, 0, 0, 18, 0, 0, 0), // 13:00 CDT + 5 hours = 18:00 UTC
        close: Date.UTC(0, 0, 0, 22, 0, 0, 0) // 17:00 CDT + 5 hours = 22:00 UTC
    },
    // Tuesday
    {
        open: Date.UTC(0, 0, 0, 17, 30, 0, 0), // 11:30 CDT + 5 hours = 16:30 UTC
        close: Date.UTC(0, 0, 0, 21, 30, 0, 0) // 16:30 CDT + 5 hours = 21:30 UTC
    },
    // Wednesday
    {
        open: Date.UTC(0, 0, 0, 20, 30, 0, 0), // 15:30 CDT + 5 hours = 20:30 UTC
        close: Date.UTC(0, 0, 0, 21, 30, 0, 0) // 16:30 CDT + 5 hours = 21:30 UTC
    },
    // Thursday
    {
        open: Date.UTC(0, 0, 0, 17, 0, 0, 0), // 12:00 CDT + 5 hours = 17:00 UTC
        close: Date.UTC(0, 0, 0, 19, 0, 0, 0) // 14:00 CDT + 5 hours = 19:00 UTC
    },
    // Friday
    {
        open: Date.UTC(0, 0, 0, 19, 0, 0, 0), // 14:00 CDT + 5 hours = 19:00 UTC
        close: Date.UTC(0, 0, 0, 21, 0, 0, 0) // 16:00 CDT + 5 hours = 21:00 UTC
    },
    // Saturday
    null
];

export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
