
export const groupBy = <T, K extends string | number>(items: T[], getKey: (item: T) => K) =>
    items.reduce((result, item) => {
        const key = getKey(item)
        result[key] = (result[key] || []).concat(item);
        return result;
    }, {} as Record<K, T[]>);

export const valuesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.values(groupBy(items, getKey)) as T[][];

export const entriesGroupedBy = <T, K extends string>(items: T[], getKey: (item: T) => K) =>
    Object.entries(groupBy(items, getKey)) as [K, T[]][];
    