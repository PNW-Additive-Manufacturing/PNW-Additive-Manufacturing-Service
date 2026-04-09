import * as FaIcons from 'react-icons/fa6';
import z from "zod";

export const ICON_LIBRARIES: Record<string, any> = { fa: FaIcons };
export const ICON_PREFIXES: Record<string, string> = { fa: "Fa" };

const ICON_CATEGORIES = Object.keys(ICON_LIBRARIES);

const ICON_TEMPLATE_STRING = "category:icon";

export const IconStringSchema = z.string()
    .refine(s => s.includes(":"), `An icon must be separated by a colon, use template ${ICON_TEMPLATE_STRING}.`)
    .refine(s => s && ICON_CATEGORIES.some(c => s?.startsWith(c)), `An icon must begin with ${ICON_CATEGORIES.join(" or ")}, use template ${ICON_TEMPLATE_STRING}.`);

export type IconString = z.infer<typeof IconStringSchema>;