import z from "zod";
import { ItemSchema } from "../Item";

export const MaterialSchema = ItemSchema.extend({
    
});

export type Material = z.infer<typeof MaterialSchema>;
