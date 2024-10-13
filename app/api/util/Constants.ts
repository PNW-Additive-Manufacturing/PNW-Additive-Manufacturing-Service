export const SESSION_COOKIE = "session-token";

export function formateDate(date: Date) {
	return date.toLocaleDateString("en-us", {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}

export function formateDateWithTime(date: Date) {
	return date.toLocaleDateString("en-us", {
		weekday: "long",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}

export function formatTime(date: Date) {
	return date.toLocaleTimeString("en-us", { hour: '2-digit', minute: '2-digit' });
}