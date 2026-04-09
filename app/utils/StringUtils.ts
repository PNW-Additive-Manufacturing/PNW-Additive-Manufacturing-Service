export function makeStringNotEmpty(str?: string): string | undefined
{
    return str == undefined ? undefined : str.length == 0 ? undefined : str;
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 B";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
