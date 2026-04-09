export function uniqueBy<T, K>(items: T[], selector: (x: T) => K): T[] {
	const map = new Map<string, T>();

	for (const item of items) {
		const key = String(selector(item));
		map.set(key, item);
	}

	return Array.from(map.values());
}
