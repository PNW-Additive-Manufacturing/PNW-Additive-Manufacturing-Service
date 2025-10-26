
/**
 * Returns the different values of objectA between objectA and objectB.
 */
export function compareObjectFields<T extends object>(objectA: T, objectB: T): Partial<T>
{
    const keys = Object.keys(objectA);
    const aDifferences: Partial<T> = {};

    for (let name of keys) 
    {
        // Record differences between objectA and objectB
        const valueA = objectA[name as keyof T];
        const valueB = objectB[name as keyof T];

        if (typeof(valueA) === "object" && valueA !== null && typeof(valueB) === "object" && valueB !== null)
        {      
            // An object requires recursion.
            aDifferences[name as keyof T] = compareObjectFields(valueA, valueB) as any;
        }
        else
        {
            if (valueA !== valueB)
            {
                aDifferences[name as keyof T] = valueA;
            }
        }
    }
    return aDifferences;
}

/**
 * Determines if all values in object of the given keys have undefined values.
 */
export function objectFieldsIsUndefined<T extends object>(object: T, keys?: string[])
{
    if (keys == undefined)
    {
        keys = Object.keys(object);
    }

    // Check if any of the specified keys is NOT undefined.

    for (let key of keys)
    {
        if (object[key as keyof T] !== undefined)
        {
            return false;
        }
    }
    return true;
}