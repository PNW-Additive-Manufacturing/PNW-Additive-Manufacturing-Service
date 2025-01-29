export function makeStringNotEmpty(str?: string): string | undefined
{
    return str == undefined ? undefined : str.length == 0 ? undefined : str;
}