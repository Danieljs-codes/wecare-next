import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const formSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .transform(val => val.toLowerCase()),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .transform(val => val.toLowerCase()),
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'doctor'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});
