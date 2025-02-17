// /home/project/src/lib/auth.ts

import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

/**
 * fullName must have at least two space-separated parts,
 * each >= 2 characters, e.g. "John Smith"
 */
const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .refine((value) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length < 2) return false;
    if (parts[0].length < 2 || parts[1].length < 2) return false;
    return true;
  }, {
    message: 'Please enter at least a first and last name, each with 2+ letters.',
  });

/**
 * onboardingSchema
 */
export const onboardingSchema = z
  .object({
    fullName: fullNameSchema,

    // services can be either one of the known enums or "other:..."
    services: z.union([
      z.enum(['keynote', 'workshops', 'coaching', 'consulting', 'facilitation']),
      z.string().regex(/^other:.+$/, {
        message: 'If selecting Other, you must specify a custom service name.',
      }),
    ]),

    account_type: z.enum(['direct', 'partner']),
    company: z.string().optional(),
    company_role: z.string().optional(),
    profile_url_type: z.enum(['website', 'bureau', 'company', 'other']),

    // Website is now required:
    website: z.string().min(2, 'Please enter a link or webpage'),
  })
  .superRefine(({ account_type, company, company_role }, ctx) => {
    // For partner => require company & role
    if (account_type === 'partner') {
      if (!company || company.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['company'],
          message: 'Company is required for partner accounts',
        });
      }
      if (!company_role || company_role.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['company_role'],
          message: 'Company role is required for partner accounts',
        });
      }
    }
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
