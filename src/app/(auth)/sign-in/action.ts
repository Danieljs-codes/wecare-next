'use server';

import { SignInFormData, signInSchema } from '@/schemas/sign-in-schema';
import { verifyPassword } from '@lib/password';
import { createSession } from '@lib/session';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const signIn = async (formData: SignInFormData) => {
  const result = signInSchema.safeParse(formData);

  if (!result.success) {
    return {
      errors: ['Invalid input'],
      data: null,
    };
  }

  const { email, password } = result.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return {
      errors: ['User not found'],
      data: null,
    };
  }

  const passwordMatch = await verifyPassword(user.password, password);

  if (!passwordMatch) {
    return {
      errors: ['Invalid password'],
      data: null,
    };
  }

  const session = await createSession(user.id);

  return {
    errors: null,
    data: session,
    message: 'Sign in successful',
    role: user.role,
  };
};
