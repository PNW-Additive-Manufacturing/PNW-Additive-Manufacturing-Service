// import z from "zod";
// import { AccountPermission } from "./Account";

// export const AccountSessionSchema = z.object({

//     email: z.email(),
//     permission: z.enum(AccountPermission),
//     firstName: z.string(),
//     lastName: z.string(),
//     isEmailVerified: z.boolean(),
//     isBanned: z.boolean(),
//     balanceInCents: z.number()
    
// });

// export type Account = z.infer<typeof AccountSessionSchema>;