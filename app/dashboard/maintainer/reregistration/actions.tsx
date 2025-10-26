"use server";

import { resAttemptAsync, resOk, resOkData, resUnauthorized } from "@/app/api/APIResponse";
import { AccountPermission } from "@/app/Types/Account/Account";
import { makeHashedRegistrationSpan, RegistrationSpanIDSchema, RegistrationSpanSchema } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { addRegistrationSpan, deleteAccountInRegistrationSpan, queryRegistrationSpanEntries } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { serveSession } from "@/app/utils/SessionUtils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RegistrationSpanSchemaWithoutId = RegistrationSpanSchema.omit({ id: true });

export async function actionAddRegistrationSpan(formData: FormData) {

    const session = await serveSession();

    return resAttemptAsync(async () => {

        // Auth
        if (!session.isSignedIn || session.account.permission !== AccountPermission.Admin) return resUnauthorized();

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

    const session = await serveSession();

    return resAttemptAsync(async () => {

        // Auth
        if (!session.isSignedIn || session.account.permission !== AccountPermission.Admin) return resUnauthorized();

        // Parse formData
        const actionData = ActionDeleteRegistrationSpanSchema.parse(Object.fromEntries(formData));

        // Insert span into database
        await deleteAccountInRegistrationSpan(actionData.spanId);

        revalidatePath("/");

        return resOk();

    });
}

// TODO: Add pagination.
const ActionFetchRegistrationSpanEntriesSchema = z.object({ spanId: RegistrationSpanIDSchema });

export async function actionFetchRegistrationSpanEntries(formData: FormData) {

    const session = await serveSession();

    return await resAttemptAsync(async () => {

        // Auth
        if (!session.isSignedIn || session.account.permission !== AccountPermission.Admin) return resUnauthorized();

        // Parse formData
        const actionData = ActionFetchRegistrationSpanEntriesSchema.parse(Object.fromEntries(formData));

        // Query entries from database
        const entries = await queryRegistrationSpanEntries(actionData.spanId);

        return resOkData({ entries });

    });
}