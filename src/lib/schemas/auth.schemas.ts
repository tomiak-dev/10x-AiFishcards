import { z } from "zod";

/**
 * Schema for validating login request
 * Used in: POST /api/auth/login
 */
export const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
  password: z.string().min(6, "Hasło musi zawierać co najmniej 6 znaków"),
});

/**
 * Schema for validating registration request
 * Used in: POST /api/auth/register
 */
export const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
  password: z.string().min(6, "Hasło musi zawierać co najmniej 6 znaków"),
});

/**
 * Schema for validating forgot password request
 * Used in: POST /api/auth/forgot-password
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
});

/**
 * Schema for validating reset password request
 * Used in: POST /api/auth/reset-password
 */
export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Hasło musi zawierać co najmniej 6 znaków"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
