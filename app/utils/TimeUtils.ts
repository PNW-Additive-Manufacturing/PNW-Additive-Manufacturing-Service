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
    // Format the date in YYYY-MM-DD format using local time
    return date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0');
}

export function formatTimeForHTMLInput(date: Date) {
    // Format the time in HH:mm format using local time
    return String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0');
}
