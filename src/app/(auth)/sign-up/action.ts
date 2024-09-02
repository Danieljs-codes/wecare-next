'use server';

import { FormData } from '@components/step-1-form';
import { db } from '@server/db';
import { doctors, patientRegistrations, users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { formSchema } from '@/schemas/sign-in-schema';
import { revalidatePath } from 'next/cache';
import {
  doctorStep2Schema,
  Step2DoctorFormData,
} from '@/schemas/sign-up-schema';
import { DateTime } from 'luxon';
import { createSession } from '@lib/session';
import { hashPassword } from '@lib/password';

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

  revalidatePath('/sign-up');

  return {
    success: true as const,
    message: 'Registration created or updated successfully',
    id: result[0].updatedId,
  };
};

export const createStep2Registration = async (data: Step2DoctorFormData) => {
  const formData = doctorStep2Schema.safeParse(data);

  if (!formData.success) {
    return {
      success: false as const,
      message: 'Invalid form data',
    };
  }

  const { specialization, yearsOfExperience, availableHours, timezone, bio } =
    formData.data;

  // Convert availableHours to ISO 8601 string UTC
  const startTime = DateTime.utc()
    .set({
      hour: availableHours.startTime.hour,
      minute: availableHours.startTime.minute,
      second: 0,
      millisecond: 0,
    })
    .toISO();

  const endTime = DateTime.utc()
    .set({
      hour: availableHours.endTime.hour,
      minute: availableHours.endTime.minute,
      second: 0,
      millisecond: 0,
    })
    .toISO();

  const registrationId = cookies().get(COOKIE_NAME)?.value;

  if (!registrationId) {
    return {
      success: false as const,
      message: 'Step 1 not completed',
    };
  }

  const registration = await db.query.patientRegistrations.findFirst({
    where: eq(patientRegistrations.id, registrationId),
  });

  if (!registration) {
    return {
      success: false as const,
      message: 'Step 1 registration not found. Please try again.',
    };
  }

  const userId = nanoid();
  const hashedPassword = await hashPassword(registration.password);
  const user = await db.batch([
    db.insert(users).values({
      id: userId,
      email: registration.email,
      password: hashedPassword,
      firstName: registration.firstName,
      lastName: registration.lastName,
      role: registration.role,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
    }),

    db.insert(doctors).values({
      id: nanoid(),
      userId,
      specialization,
      yearsOfExperience,
      timezone,
      startTime,
      endTime,
      bio,
    }),

    db
      .delete(patientRegistrations)
      .where(eq(patientRegistrations.id, registrationId)),
  ]);

  await createSession(userId);
  cookies

  return {
    success: true as const,
    message: 'Registration created successfully',
    role: registration.role,
  };
};
