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
        open: Date.UTC(0, 0, 0, 18, 0, 0, 0),
        close: Date.UTC(0, 0, 0, 22, 0, 0, 0)
    },
    // Tuesday
    {
        open: Date.UTC(0, 0, 0, 17, 30, 0, 0),
        close: Date.UTC(0, 0, 0, 22, 30, 0, 0)
    },
    // Wednesday
    {
        open: Date.UTC(0, 0, 0, 20, 30, 0, 0),
        close: Date.UTC(0, 0, 0, 22, 30, 0, 0)
    },
    // Thursday
    {
        open: Date.UTC(0, 0, 0, 17, 0, 0, 0),
        close: Date.UTC(0, 0, 0, 19, 0, 0, 0)
    },
    // Friday
    {
        open: Date.UTC(0, 0, 0, 19, 0, 0, 0),
        close: Date.UTC(0, 0, 0, 21, 0, 0, 0)
    },
    // Saturday
    null
];

export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
