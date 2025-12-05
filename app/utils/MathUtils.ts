export function dollarsToCents(dollars: number) {

    // Gets around floating-point rounding errors such as 9.04 * 100 = 903.9999999999999 and 9.05 * 100 = 905.0000000000001

    const [whole, frac = ""] = dollars.toString().split(".");
    return parseInt(whole) * 100 + parseInt(frac.padEnd(2, "0").slice(0, 2));

}