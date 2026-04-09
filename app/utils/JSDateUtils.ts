export function formatDateToYYYYMMDD(date: Date)
{
    return date.toISOString().split('T')[0];
}

export function fromLocalDateHTMLInput(date: Date | string): Date {

    date = typeof date === "string" ? new Date(date) : date;

    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + tzOffset);
}