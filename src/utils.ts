
/** Returns an object containing the elements from the given array indexed by the key returned 
 *  from getKey function applied to each element.
 * 
 *  Elements for which the getKey return the same key are added to the same array */
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
