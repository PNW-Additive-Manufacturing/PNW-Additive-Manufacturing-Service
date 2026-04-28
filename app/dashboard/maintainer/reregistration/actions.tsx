"use server";

import { resAttemptAsync, resOk, resOkData, resUnauthorized } from "@/app/api/APIResponse";
import { serveOptionalSession } from "@/app/api/util/SessionHelper";
import { AccountPermission } from "@/app/Types/Account/Account";
import { makeHashedRegistrationSpan, RegistrationSpanIDSchema, RegistrationSpanSchema } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { addRegistrationSpan, deleteAccountInRegistrationSpan, queryRegistrationSpanEntries, updateRegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RegistrationSpanSchemaWithoutId = RegistrationSpanSchema.omit({ id: true });

export async function actionAddRegistrationSpan(formData: FormData) {

    const JWT = await serveOptionalSession();

    return resAttemptAsync(async () => {

        // Auth
        if (JWT === null || JWT.permission !== AccountPermission.Admin) return resUnauthorized();

        // Parse formData
        const spanToAddWithoutId = RegistrationSpanSchemaWithoutId.parse(Object.fromEntries(formData)); // Convert formData from class to Record<string, any>
        // Complete Span by generating the hash.
        const spanToAdd = makeHashedRegistrationSpan(spanToAddWithoutId);

        // Insert span into database
        await addRegistrationSpan(spanToAdd);

        revalidatePath("/");

        return resOk();

    });
}

const ActionDeleteRegistrationSpanSchema = z.object({ spanId: RegistrationSpanIDSchema });

export async function actionDeleteRegistrationSpan(formData: FormData) {
    const JWT = await serveOptionalSession();

    return resAttemptAsync(async () => {

        // Auth
        if (JWT === null || JWT.permission !== AccountPermission.Admin) return resUnauthorized();

        // Parse formData
        const actionData = ActionDeleteRegistrationSpanSchema.parse(Object.fromEntries(formData));

        // Insert span into database
        await deleteAccountInRegistrationSpan(actionData.spanId);

        revalidatePath("/");

        return resOk();

    });
}

const ActionUpdateRegistrationSpanSchema = z.object({
    spanId: RegistrationSpanIDSchema,
    name: z.string().min(1),
    beginAt: z.coerce.date(),
    endAt: z.coerce.date(),
});

export async function actionUpdateRegistrationSpan(formData: FormData) {
    const JWT = await serveOptionalSession();

    return resAttemptAsync(async () => {
        if (JWT === null || JWT.permission !== AccountPermission.Admin) return resUnauthorized();

        const { spanId, name, beginAt, endAt } = ActionUpdateRegistrationSpanSchema.parse(Object.fromEntries(formData));

        await updateRegistrationSpan(spanId, name, beginAt, endAt);

        revalidatePath("/");

        return resOk();
    });
}

// TODO: Add pagination.
const ActionFetchRegistrationSpanEntriesSchema = z.object({ spanId: RegistrationSpanIDSchema });

export async function actionFetchRegistrationSpanEntries(formData: FormData) {

    const JWT = await serveOptionalSession();

    return await resAttemptAsync(async () => {

        // Auth
        if (JWT === null || JWT.permission !== AccountPermission.Admin) return resUnauthorized();

        // Parse formData
        const actionData = ActionFetchRegistrationSpanEntriesSchema.parse(Object.fromEntries(formData));

        // Query entries from database
        const entries = await queryRegistrationSpanEntries(actionData.spanId);

        return resOkData({ entries });

    });
}