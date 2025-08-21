import { z } from "zod";
import { createHash } from "crypto";

export const RegistrationSpanIDSchema = z.string().min(40).max(40);

export const RegistrationSpanSchema = z.object({
    id: RegistrationSpanIDSchema,
    beginAt: z.coerce.date(), // ISO 8601
    endAt: z.coerce.date(),   // ISO 8601
    name: z.string().min(1)
});
export type RegistrationSpan = z.infer<typeof RegistrationSpanSchema>;

export const RegistrationSpanWithAccountsSchema = RegistrationSpanSchema.extend({
    accountEmailsRegistered: z.string().array()
});
export type RegistrationSpanWithAccounts = z.infer<typeof RegistrationSpanWithAccountsSchema>;

export function makeRegistrationSpanHash(span: Omit<RegistrationSpan, 'id'>) {
    const str = `${span.beginAt.toISOString()}|${span.endAt.toISOString()}|${span.name}`;
    const hash = createHash("sha1").update(str).digest("hex");
    return hash;
}

export function makeHashedRegistrationSpan(span: Omit<RegistrationSpan, 'id'>): RegistrationSpan {
    return {
        ...span,
        id: makeRegistrationSpanHash(span)
    }
}

export const RegistrationSpanEntrySchema = z.object({
    spanId: RegistrationSpanIDSchema,
    submittedAt: z.coerce.date(),
    accountEmail: z.string(),
    yearOfStudy: z.string(),
    department: z.string()
});
export type RegistrationSpanEntry = z.infer<typeof RegistrationSpanEntrySchema>;