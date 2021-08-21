
/** Returns an object containing the elements from the given array indexed by the key returned 
 *  from getKey function applied to each element.
 * 
 *  If any two elements would have the same key returned by getKey the last one gets added to 
 *  the map. */
export const groupBy = <T, K extends string | number>(items: T[], getKey: (item: T) => K) => 
    items.reduce((result, item) => {
        const key = getKey(item)
        result[key] = (result[key] || []).concat(item)
        return result
    }, {} as Record<K, T[]>)

export const valuesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.values(groupBy(items, getKey)) as T[][]

export const entriesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.entries(groupBy(items, getKey)) as [K, T[]][]

/** Same as entriesGroupedBy but allows non-strings as first element (key) in the tuples */
export const entriesGroupedBy2 = <T, K>(
    items: T[],
    getKey: (item: T) => K,
    getKeyToString: (key: K) => string
): [K, T[]][] => {
    const map = new Map<string, K>()
    return entriesGroupedBy(items, item => {
        const k = getKey(item)
        const id = getKeyToString(k)
        map.set(id, k)
        return id
    }).map(([id, items]) => [map.get(id)!, items])
}

/** Sum the numbers in the given array. Just a shorthand for that awkward reduce function. */
export const sum = (items: number[]) => items.reduce((a, b) => a + b, 0)
