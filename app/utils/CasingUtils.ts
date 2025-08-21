import { z } from "zod";

/**
 * Normalizes object keys from SQL (Postgres.JS, typically lowercase) to match the casing
 * defined in a provided Zod schema. 
 *
 * This function performs a shallow transformation only and nested objects 
 * are not processed recursively.
 */
export function correctSQLCasingWithZod(data: Record<string, any>, schema: z.ZodObject<any>) {
    const loweredSchemaKeys = Object.fromEntries(Object.keys(schema.shape).map(k => [k.toLocaleLowerCase(), k]));

    const correctedData: Record<string, any> = {};

    for (let key of Object.keys(data)) {
        const lowObjectKey = key.toLowerCase();

        // If the key matches a schema field (case-insensitive), 
        // map it to the correctly cased schema key.
        if (lowObjectKey in loweredSchemaKeys) correctedData[loweredSchemaKeys[lowObjectKey]] = data[key];
    }
    return correctedData;
}
