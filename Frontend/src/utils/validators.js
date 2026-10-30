import { z } from "zod";

/**
 * Password complexity regular expressions:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

/**
 * Calculates password strength on a 0-4 scale.
 */
export const calculatePasswordStrength = (password = "") => {
  const checks = {
    length: password.length >= 8,
    uppercase: passwordRegex.uppercase.test(password),
    lowercase: passwordRegex.lowercase.test(password),
    number: passwordRegex.number.test(password),
    special: passwordRegex.special.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  let score = 0;
  let label = "Very Weak";
  let color = "bg-gray-200 text-gray-500";

  if (!password) {
    return { score: 0, label: "", checks, passedCount: 0 };
  }

  if (passedCount <= 2) {
    score = 1;
    label = "Weak";
    color = "bg-red-500 text-red-600";
  } else if (passedCount === 3) {
    score = 2;
    label = "Fair";
    color = "bg-amber-500 text-amber-600";
  } else if (passedCount === 4) {
    score = 3;
    label = "Good";
    color = "bg-emerald-500 text-emerald-600";
  } else if (passedCount === 5) {
    score = 4;
    label = "Strong";
    color = "bg-green-600 text-green-700";
  }

  return { score, label, color, checks, passedCount };
};

export const loginSchema = z.object({
  emailId: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    emailId: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex.uppercase, "Must include at least one uppercase letter")
      .regex(passwordRegex.lowercase, "Must include at least one lowercase letter")
      .regex(passwordRegex.number, "Must include at least one number")
      .regex(passwordRegex.special, "Must include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().default(true).optional(),
    adminInviteCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

