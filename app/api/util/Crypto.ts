import "server-only";

import * as crypto from "crypto";

export function GetRandomString(charCount: number) {
    return crypto.randomBytes(charCount).toString("hex");
}