'use server';

import { FormData } from '@components/step-1-form';
import { db } from '@server/db';
import { patientRegistrations, users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { formSchema } from '@/schemas/sign-in-schema';

const COOKIE_NAME = 'registration';

export const getPatientRegistrationDetails = async () => {
  console.log('Got Here');

  const registrationCookie = cookies().get(COOKIE_NAME);
  if (!registrationCookie) {
    return null;
  }

  const registrationData = await db.query.patientRegistrations.findFirst({
    where: eq(patientRegistrations.id, registrationCookie.value),
  });

  if (!registrationData) {
    return null;
  }

  return registrationData;
};

export const createStep1Registration = async (data: FormData) => {
  const formData = formSchema.safeParse(data);

  if (!formData.success) {
    return {
      success: false as const,
      message: 'Invalid form data',
    };
  }

  const { email, password, firstName, lastName, role } = formData.data;

  let registrationId = cookies().get(COOKIE_NAME)?.value;

  if (!registrationId) {
    registrationId = nanoid();
    cookies().set(COOKIE_NAME, registrationId, {
      httpOnly: true,
      secure: true,
    });
  }

  // Validate if user with email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      success: false as const,
      message: 'An account with this email already exists',
    };
  }
  const result = await db
    .insert(patientRegistrations)
    .values({
      id: registrationId,
      firstName,
      lastName,
      email,
      password,
      role,
    })
    .onConflictDoUpdate({
      target: patientRegistrations.id,
      set: {
        firstName,
        lastName,
        email,
        password,
        role,
        updatedAt: new Date().toISOString(),
      },
    })
    .returning({ updatedId: patientRegistrations.id });

  if (result.length === 0) {
    return {
      success: false as const,
      message: 'Failed to create or update registration',
    };
  }

  return {
    success: true as const,
    message: 'Registration created or updated successfully',
    id: result[0].updatedId,
  };
};
