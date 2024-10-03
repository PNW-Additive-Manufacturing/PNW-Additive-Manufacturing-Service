export const SESSION_COOKIE = "session-token";

export function formateDate(date: Date) {
	return date.toLocaleDateString("en-us", {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}
