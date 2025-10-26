"use server";

import { resAttemptAsync, resError, resOk, resUnauthorized } from "@/app/api/APIResponse";
import { RegistrationSpanIDSchema } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { recordAccountInRegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { serveSession } from "@/app/utils/SessionUtils";
import { z } from "zod";

const registerAccountToReregistrationSpanSchema = z.object({
	spanId: RegistrationSpanIDSchema,
    yearOfStudy: z.string().min(1),
    department: z.string().min(1)
});
export async function actionRegisterAccountToReregistrationSpan(formData: FormData) {

	return await resAttemptAsync(async () => {

		const session = await serveSession();
		if (!session.isSignedIn) return resUnauthorized();

		const parse = registerAccountToReregistrationSpanSchema.safeParse({ 
            spanId: formData.get("registration-span-id"),
            yearOfStudy: formData.get("year-of-study"),
            department: formData.get("department")
        });
        if (!parse.success) return resError(parse.error.message);

		await recordAccountInRegistrationSpan(parse.data.spanId, session.account.email, parse.data.yearOfStudy, parse.data.department);

		return resOk();

	});
}