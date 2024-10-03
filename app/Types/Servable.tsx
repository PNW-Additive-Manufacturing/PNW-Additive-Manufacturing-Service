export default interface Servable<T> {
	toTransit(what: keyof T): T;
}
