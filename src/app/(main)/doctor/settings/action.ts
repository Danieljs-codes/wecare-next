'use server';

import { doctorSettingsSchema } from '@/schemas/new-appointment';
import { clearSession, getSession } from '@lib/session';
import { db } from '@server/db';
import { doctors, users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const doctorSettingsSchemaExtended = doctorSettingsSchema.extend({
  image: z.string().optional(),
});

export const updateDoctorSettings = async (
  input: z.infer<typeof doctorSettingsSchemaExtended>
) => {
  const data = doctorSettingsSchemaExtended.safeParse(input);

  if (!data.success) {
    return {
      error: 'Invalid input',
    };
  }

  const session = await getSession();

  if (!session) {
    return {
      error: 'Session expired',
    };
  }

  if (session.user.role !== 'doctor') {
    return {
      error: 'You are not authorized to update doctor settings',
    };
  }

  // Get corresponding doctor
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, session.user.id),
    with: {
      user: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          email: true,
        },
      },
    },
  });

  if (!doctor) {
    clearSession();
    return {
      error: 'Doctor not found',
    };
  }

  const { image, ...rest } = data.data;

  await db.batch([
    db
      .update(doctors)
      .set({
        bio: rest.bio,
        price: rest.price * 100,
        specialization: rest.specialization,
        timezone: rest.timezone,
        country: rest.country,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(doctors.id, doctor.id)),

    db
      .update(users)
      .set({
        firstName: rest.firstName,
        lastName: rest.lastName,
        email: rest.email,
        avatar: image ?? doctor.user.avatar,
      })
      .where(eq(users.id, doctor.user.id)),
  ]);

  revalidatePath('/doctor/settings');

  return {
    success: true,
    message: 'Settings updated successfully',
    image,
  };
};
