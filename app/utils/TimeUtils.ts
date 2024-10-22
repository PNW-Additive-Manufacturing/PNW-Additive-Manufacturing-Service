export function addMinutes(date: Date, amount: number) {
    return new Date(date.getTime() + amount * 60000);
}

export function withDate(time: Date, date: Date)
{
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}