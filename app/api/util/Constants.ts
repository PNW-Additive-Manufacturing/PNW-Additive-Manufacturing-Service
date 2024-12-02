const timeZone = "America/Chicago";

export function formateDate(date: Date) {
	return new Intl.DateTimeFormat("en-us", {
	  timeZone: timeZone,
	  weekday: "long",
	  month: "short",
	  day: "numeric",
	}).format(date);
  }
  
  export function formateDateWithTime(date: Date) {
	return new Intl.DateTimeFormat("en-us", {
	  timeZone: timeZone,
	  weekday: "long",
	  month: "short",
	  day: "numeric",
	  hour: "2-digit",
	  minute: "2-digit",
	}).format(date);
  }
  

export function formatTime(date: Date) {
	return date.toLocaleTimeString("en-us", { hour: '2-digit', minute: '2-digit' });
}