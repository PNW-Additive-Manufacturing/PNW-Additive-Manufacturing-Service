import z from "zod";
import { IconStringSchema } from "./IconString";

export const ItemSchema = z.object({

    shortName: z.string(),
    wholeName: z.string(),
    description: z.string(),
    icon: IconStringSchema.optional().nullable(),
    benefits: z.string().array(),
    cons: z.string().array(),
    learnMoreURL: z.string().url().optional()

});

export type Item = z.infer<typeof ItemSchema>;