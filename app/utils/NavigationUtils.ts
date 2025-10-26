import { headers } from "next/headers";

export async function reqCurrentPath()
{
    // Grabs the x-current-path header added by proxy.ts
    return (await headers()).get("x-current-path")!;
}

// export async function reqRedirect(pathName: string): Promise<never>
// {
//     // https://developers.cloudflare.com/fundamentals/reference/http-headers/
//     // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-Host
//     const xForwardedHost = (await headers()).get("X-Forwarded-Host"); 
//     const Host = (await headers()).get("Host"); 

//     console.log(xForwardedHost, Host, pathName);

//     // if (xForwardedHost !== undefined)
//     // {
//     //     // console.log(`http://${xForwardedHost}${pathName}`);

//     //     redirect(`http://${xForwardedHost}${pathName}`);
//     // }
//     redirect(pathName);
// }