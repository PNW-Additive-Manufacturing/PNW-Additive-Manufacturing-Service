import z from "zod";
import { ItemSchema } from "../Item";

export const ManufacturingMethodSchema = ItemSchema.extend({

    company: z.string().optional(),
    unit: z.string()

});

export type ManufacturingMethod = z.infer<typeof ManufacturingMethodSchema>;
