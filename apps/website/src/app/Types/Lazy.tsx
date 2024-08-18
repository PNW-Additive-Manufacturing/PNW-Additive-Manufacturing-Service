type LazyGetter<T> = () => Promise<T | undefined>;

export default class Lazy<T> {
	private _cachedValue?: T;
	private _hasFetched: boolean = false;
	private _getterFunction: LazyGetter<T>;

	public constructor(getter: LazyGetter<T>, defaultValue?: T) {
		this._getterFunction = getter;
		this._cachedValue = defaultValue;
	}

	public async retrieve(): Promise<T | undefined> {
		if (this._cachedValue == undefined && !this._hasFetched) {
			this._cachedValue = await this._getterFunction();
			this._hasFetched = true;
		}
		return this._cachedValue;
	}

	public static WithValue<T>(value: T) {
		return new Lazy<T>(() => Promise.resolve(value), value);
	}
}
