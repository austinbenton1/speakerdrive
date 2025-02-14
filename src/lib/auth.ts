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
 * onboardingSchema
 * - fullName
 * - services: must be one of:
 *    - "keynote", "workshops", "coaching", "consulting", "facilitation"
 *    - or "other:customValue" with text after the colon
 * - account_type: 'direct' or 'partner'
 * - company: required if account_type = 'partner'
 * - company_role: required if account_type = 'partner'
 * - profile_url_type: one of: 'website', 'linkedin', 'bureau', 'company', 'other'
 * - website: optional
 */
export const onboardingSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),

    // Updated `services`:
    services: z.union([
      z.enum(['keynote', 'workshops', 'coaching', 'consulting', 'facilitation']),
      // Matches "other:..." with at least one character after the colon
      z.string().regex(/^other:.+$/, {
        message: 'If selecting Other, you must specify a custom service name.',
      }),
    ]),

    account_type: z.enum(['direct', 'partner']),
    company: z.string().optional(),
    company_role: z.string().optional(),

    profile_url_type: z.enum(['website', 'bureau', 'company', 'other']),
    website: z.string().optional(),
  })
  .superRefine(({ account_type, company, company_role }, ctx) => {
    // Conditionally require `company` and `company_role` if account_type is 'partner'
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
