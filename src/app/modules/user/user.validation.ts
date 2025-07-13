import z from "zod";

export const createUserZodSchema = z.object({
      name: z
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 character long" })
        .max(50, { message: "Name cannot exceed 50 character" }),
      email: z
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format" })
        .min(5, { message: "Email must be at least 5 character long" })
        .max(100, { message: "Email cannot exceed 100 character" }),
      password: z
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "Password must be at least 8 character long." })
        .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase letter.",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Password must contain at least 1 number.",
        }),
      phone: z 
        .string({invalid_type_error: "Phone Number must be String"})
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
      address: z
        .string({invalid_type_error: "Address must be string"})
        .max(200, {message: "Address cannot exceed 200 character"})
        .optional(),
    });