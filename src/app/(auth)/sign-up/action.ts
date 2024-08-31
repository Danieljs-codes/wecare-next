'use server';

import { FormData } from '@components/step-1-form';
import { db } from '@server/db';
import { patientRegistrations } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

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
  let registrationId = cookies().get(COOKIE_NAME)?.value

  if (!registrationId) {
    registrationId = nanoid()
    cookies().set(COOKIE_NAME, registrationId, { httpOnly: true, secure: true })
  }

  const result = await db
    .insert(patientRegistrations)
    .values({
      id: registrationId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    })
    .onConflictDoUpdate({
      target: patientRegistrations.id,
      set: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
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
