"use server";

import { env } from "process";

type GeolocationResult = {
	city: {
		names: { en: string };
	};
};

export default async function GeolocationLookup(ip: string) {
	return fetch(`https://api.findip.net/${ip}/?token=${env.FINDIP_TOKEN}`)
		.then((res) => res.json())
		.then((json) => json as GeolocationResult);
}
