"use server";

import { resAttemptAsync, resError, resOk, resUnauthorized } from "@/app/api/APIResponse";
import { retrieveSafeJWTPayload } from "@/app/api/util/JwtHelper";
import { RegistrationSpanIDSchema } from "@/app/Types/RegistrationSpan/RegistrationSpan";
import { recordAccountInRegistrationSpan } from "@/app/Types/RegistrationSpan/RegistrationSpanServe";
import { z } from "zod";

const registerAccountToReregistrationSpanSchema = z.object({
	spanId: RegistrationSpanIDSchema,
    yearOfStudy: z.string().min(1),
    department: z.string().min(1)
});
export async function actionRegisterAccountToReregistrationSpan(formData: FormData) {

	return await resAttemptAsync(async () => {

		const JWT = await retrieveSafeJWTPayload();
		if (JWT === null) return resUnauthorized();

		const parse = registerAccountToReregistrationSpanSchema.safeParse({ 
            spanId: formData.get("registration-span-id"),
            yearOfStudy: formData.get("year-of-study"),
            department: formData.get("department")
        });
        if (!parse.success) return resError(parse.error.message);

		await recordAccountInRegistrationSpan(parse.data.spanId, JWT.email, parse.data.yearOfStudy, parse.data.department);

		return resOk();

	});
}