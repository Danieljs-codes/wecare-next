'use server';

import { FormData } from '@components/step-1-form';
import { db } from '@server/db';
import {
  doctors,
  patientRegistrations,
  patients,
  users,
} from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { formSchema } from '@/schemas/sign-in-schema';
import { revalidatePath } from 'next/cache';
import {
  doctorStep2Schema,
  patientStep2Schema,
  Step2DoctorFormData
} from '@/schemas/sign-up-schema';
import { DateTime } from 'luxon';
import { createSession } from '@lib/session';
import { hashPassword } from '@lib/password';
import { z } from 'zod';

const COOKIE_NAME = 'registration';

export const getPatientRegistrationDetails = async () => {
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

  const {
    specialization,
    yearsOfExperience,
    availableHours,
    timezone,
    bio,
    price,
  } = formData.data;

  // Convert price to cents
  const priceInCents = Math.round(price * 100);

  // Convert availableHours to ISO 8601 string UTC
  const startTime = DateTime.fromObject(
    {
      hour: availableHours.startTime.hour,
      minute: availableHours.startTime.minute,
      second: 0,
      millisecond: 0,
    },
    { zone: timezone }
  )
    .toUTC()
    .toISO();

    const endTime = DateTime.fromObject(
      {
        hour: availableHours.endTime.hour,
        minute: availableHours.endTime.minute,
        second: 0,
        millisecond: 0,
      },
      { zone: timezone }
    )
      .toUTC()
      .toISO()

  if (!startTime || !endTime) {
    return {
      success: false as const,
      message: 'Invalid available hours',
    };
  }

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
      firstName: registration.firstName.toLowerCase(),
      lastName: registration.lastName.toLowerCase(),
      role: registration.role,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
    }),

    db.insert(doctors).values({
      id: nanoid(),
      userId,
      specialization: specialization.toLowerCase(),
      yearsOfExperience,
      timezone,
      startTime,
      endTime,
      bio,
      price: priceInCents, // Store price in cents
    }),

    db
      .delete(patientRegistrations)
      .where(eq(patientRegistrations.id, registrationId)),
  ]);

  await createSession(userId);
  cookies().delete(COOKIE_NAME);

  return {
    success: true as const,
    message: 'Registration created successfully',
    role: registration.role,
  };
};

const createStep2SchemaExtended = patientStep2Schema
  .omit({
    birthDate: true,
  })
  .extend({
    birthDate: z
      .object({
        year: z.number().int().min(1900).max(new Date().getFullYear()),
        month: z.number().int().min(1).max(12),
        day: z.number().int().min(1).max(31),
      })
      .refine(
        ({ year, month, day }) => {
          const date = new Date(year, month - 1, day);
          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          );
        },
        { message: 'Invalid date' }
      ),
  });

export async function createStep2PatientRegistration(
  data: z.infer<typeof createStep2SchemaExtended>
) {
  const formData = createStep2SchemaExtended.safeParse(data);

  if (!formData.success) {
    return {
      success: false as const,
      message: 'Invalid form data',
    };
  }

  const { birthDate, ...rest } = formData.data;

  const birthDateISO = DateTime.fromObject(
    {
      year: birthDate.year,
      month: birthDate.month,
      day: birthDate.day,
    },
    { zone: 'UTC' }
  ).toISO();

  if (!birthDateISO) {
    return {
      success: false as const,
      message: 'Invalid birth date',
    };
  }

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
      email: registration.email.toLowerCase(),
      password: hashedPassword,
      firstName: registration.firstName.toLowerCase(),
      lastName: registration.lastName.toLowerCase(),
      role: registration.role,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
    }),

    db.insert(patients).values({
      id: nanoid(),
      userId,
      birthDate: birthDateISO,
      address: rest.address,
      gender: rest.gender.toLowerCase(),
      bloodType: rest.bloodType,
      genoType: rest.genoType,
      mobileNumber: rest.mobileNumber,
      occupation: rest.occupation.toLowerCase(),
      timezone: rest.timezone,
    }),

    db
      .delete(patientRegistrations)
      .where(eq(patientRegistrations.id, registrationId)),
  ]);

  await createSession(userId);

  cookies().delete(COOKIE_NAME);

  return {
    success: true as const,
    message: 'Registration created successfully',
    role: registration.role,
  };
}
