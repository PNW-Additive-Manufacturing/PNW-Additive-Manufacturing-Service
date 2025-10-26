import db from "@/app/api/Database";
import { correctSQLCasingWithZod } from "@/app/utils/CasingUtils";
import { PostgresError } from "postgres";
import { RegistrationSpan, RegistrationSpanEntry, RegistrationSpanEntrySchema, RegistrationSpanSchema } from "./RegistrationSpan";

export async function queryInCompleteReregistration(date: Date, accountEmail: string): Promise<null | RegistrationSpan> {
    const query = (await db`
        SELECT rs.*
        FROM ReregistrationSpan rs
        WHERE rs.beginAt <= ${date}
            AND rs.endAt >= ${date}
            AND NOT EXISTS (
                SELECT 1
                FROM ReregistrationSpanEntry rse
                WHERE rse.SpanId = rs.Id
                AND rse.AccountEmail = ${accountEmail}
            )
        LIMIT 1`)?.at(0);

    // If query is present, the account does not have an in the current registration.

    if (!query) return null;

    try {
        return parseRegistrationSpanFromSQL(query);
    }
    catch (error) {
        console.error(`Unable to parse registration span! ${error}`);
        return null;
    }
}

export type RegistrationSpanAccountDetails = (RegistrationSpan & { entry?: RegistrationSpanEntry });
export async function queryAccountReregistration(id: string, accountEmail: string): Promise<RegistrationSpanAccountDetails | null> {
    const query = (await db`SELECT s.BeginAt, s.EndAt, s.Name, e.SubmittedAt, e.YearOfStudy, e.Department FROM ReregistrationSpan s
                            LEFT JOIN ReregistrationSpanEntry e ON e.SpanId = s.Id AND e.accountEmail=${accountEmail}
                            WHERE s.Id=${id};`)?.at(0);

    // If the span exists and the user has an entry = YearOfStudy and Department.
    // If the span exists but the user has no entry = YearOfStudy and Department will be NULL.
    // If the span doesn't exist = zero rows.

    if (!query) return null; // Registration doesn't exist!

    try {
        const hasEntry = query.yearofstudy !== null && query.department !== null;

        return Object.assign(parseRegistrationSpanFromSQL({ ...query, id }), {
            entry: hasEntry ? parseRegistrationSpanEntryFromSQL({ ...query, spanId: id, accountEmail }) : null
        }) as RegistrationSpanAccountDetails;
    }
    catch (error) {
        console.error(`Unable to parse registration span! ${error}`);
        return null;
    }
}

export async function queryAllRegistrationSpans() {
    return (await db`SELECT * FROM ReregistrationSpan ORDER BY EndAt DESC`).map(q => parseRegistrationSpanFromSQL(q));
}

export async function recordAccountInRegistrationSpan(spanID: RegistrationSpan["id"], accountEmail: string, yearOfStudy: string, department: string): Promise<void> {
    try {
        await db`INSERT INTO ReregistrationSpanEntry (SpanId, AccountEmail, YearOfStudy, Department, SubmittedAt) 
                                              VALUES (${spanID}, ${accountEmail}, ${yearOfStudy}, ${department}, ${new Date()})`;

        return;
    }
    catch (error) {
        // PostgreSQL error code for a duplicate key violation
        if ((error as PostgresError)?.code === "23505") {
            return;
        }
        else {
            throw error;
        }
    }
}

export async function addRegistrationSpan(span: RegistrationSpan) {
    await db`INSERT INTO ReregistrationSpan (Id, Name, BeginAt, EndAt) VALUES (${span.id}, ${span.name}, ${span.beginAt}, ${span.endAt})`;
}


export async function deleteAccountInRegistrationSpan(spanId: RegistrationSpan["id"]) {
    await db`DELETE FROM ReregistrationSpan WHERE Id=${spanId}`;
}

export async function queryRegistrationSpanEntries(spanId: RegistrationSpan["id"]) {
    const rows = await db`SELECT e.*, a.firstname AS "firstName", a.lastname AS "lastName" FROM ReregistrationSpanEntry e
    JOIN Account a ON a.email = e.accountEmail
    WHERE e.SpanId = ${spanId}
    ORDER BY e.SubmittedAt DESC;
  `;

    return rows.map(r => ({
        ...parseRegistrationSpanEntryFromSQL(r),
        firstName: r.firstName,
        lastName: r.lastName,
    }));
}


function parseRegistrationSpanFromSQL(row: any): RegistrationSpan {
    return RegistrationSpanSchema.parse(correctSQLCasingWithZod(row, RegistrationSpanSchema));
}

function parseRegistrationSpanEntryFromSQL(row: any): RegistrationSpanEntry {
    return RegistrationSpanEntrySchema.parse(correctSQLCasingWithZod(row, RegistrationSpanEntrySchema));
}