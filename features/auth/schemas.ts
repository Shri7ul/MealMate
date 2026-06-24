import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    role: z.enum(["manager", "member"]),
    messName: z.string().trim().optional()
  })
  .superRefine((values, context) => {
    if (values.role === "manager" && !values.messName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mess name is required for managers.",
        path: ["messName"]
      });
    }
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim().optional(),
  avatar: z.string().url("Enter a valid image URL.").optional().or(z.literal(""))
});

export const messSchema = z.object({
  name: z.string().trim().min(2, "Mess name must be at least 2 characters.")
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type MessValues = z.infer<typeof messSchema>;
