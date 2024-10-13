export function addMinutes(date: Date, amount: number) {
    return new Date(date.getTime() + amount * 60000);
}