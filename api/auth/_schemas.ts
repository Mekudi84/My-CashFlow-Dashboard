import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(200),
  preferredCurrency: z.enum(["USD", "NGN", "GBP", "EUR"]).default("USD"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  preferredCurrency: z.enum(["USD", "NGN", "GBP", "EUR"]),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const accessTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  preferredCurrency: z.enum(["USD", "NGN", "GBP", "EUR"]),
});
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;