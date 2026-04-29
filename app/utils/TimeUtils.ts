export function addMinutes(date: Date, amount: number) {
    return new Date(date.getTime() + amount * 60000);
}

export function addDays(date: Date, amount: number)
{
    return new Date(date.getTime() + amount * 60000 * 1440);
}

export function withDate(input: Date, date: Date): Date {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        input.getHours(),
        input.getMinutes(),
        input.getSeconds(),
        input.getMilliseconds()
    );
}

export function withTime(input: Date, time: Date): Date {
    return new Date(
        input.getFullYear(),
        input.getMonth(),
        input.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds()
    );
}

export function fixInputDate(utcNumb: number)
{
    return new Date(utcNumb + (new Date().getTimezoneOffset() * 60000));
}

export function formatDateForHTMLInput(date: Date) {
    return date.getUTCFullYear() +
        '-' +
        String(date.getUTCMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getUTCDate()).padStart(2, '0');
}

export function formatTimeForHTMLInput(date: Date) {
    // Format the time in HH:mm format using local time
    return String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0');
}

export function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

export function nextWeekday(date: Date): Date {
    const d = new Date(date);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
}

export function leadTimeSpansWeekend(startDate: Date, days: number): boolean {
    const d = new Date(startDate);
    for (let i = 0; i < days; i++) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() === 0 || d.getDay() === 6) return true;
    }
    return false;
}
