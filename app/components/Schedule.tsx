// TODO: We do not factor for different timezones! Change in the future!!!

// We can do this because NextJS uses a per-transaction framework.
const currentDate = new Date();
const currentTime = new Date(0, 0, 0, currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds());
// export const currentDay = 2;
export const currentDay = new Date().getDay();

export type WeeklySchedule = ({
    open: Date;
    close: Date;
} | null)[];

// Hard-coded schedule. Could be adapted in the future.
export const weeklySchedule: WeeklySchedule = [
    // Sunday
    null,
    // Monday
    {
        open: new Date(0, 0, 0, 13, 0, 0, 0),
        close: new Date(0, 0, 0, 17, 0, 0, 0)
    },
    // Tuesday
    {
        open: new Date(0, 0, 0, 11, 30, 0, 0),
        close: new Date(0, 0, 0, 16, 30, 0, 0)
    },
    // Wed
    {
        open: new Date(0, 0, 0, 15, 30, 0, 0),
        close: new Date(0, 0, 0, 16, 30, 0, 0)
    },
    // Thursday
    {
        open: new Date(0, 0, 0, 12, 0, 0, 0),
        close: new Date(0, 0, 0, 14, 0, 0, 0)
    },
    // Friday
    {
        open: new Date(0, 0, 0, 14, 0, 0, 0),
        close: new Date(0, 0, 0, 16, 0, 0, 0)
    },
    // Saturday
    null
];

export const isOpen = weeklySchedule[currentDay] != null && currentTime > weeklySchedule[currentDay]!.open && currentTime < weeklySchedule[currentDay]!.close;
export const closingTime = weeklySchedule[currentDay] == null ? null : weeklySchedule[currentDay]?.close!;

export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
