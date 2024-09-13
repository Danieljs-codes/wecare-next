'use server';

import { getSession } from '@lib/session';
import { db } from '@server/db';
import { users, doctors, appointments, reviews } from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const reviewSchema = z.object({
  doctorId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function reviewDoctor(input: z.infer<typeof reviewSchema>) {
  const session = await getSession();
  if (!session) {
    return { error: 'You must be logged in to submit a review' };
  }

  if (session.user.role !== 'patient') {
    return { error: 'You are not authorized to submit a review' };
  }

  // Getting patient
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
    },
    with: {
      patient: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!user || user.patient.length === 0) {
    return { error: 'Patient not found' };
  }

  const patient = user.patient[0];

  const data = reviewSchema.safeParse(input);
  if (!data.success) {
    return { error: data.error.message };
  }

  const { doctorId, rating, comment } = data.data;

  // Validate doctorId
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
    columns: {
      id: true,
      userId: true,
    },
  });

  if (!doctor) {
    return { error: 'Doctor not found' };
  }

  // Check if the patient has a completed appointment with the doctor
  const completedAppointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.patientId, patient.id),
      eq(appointments.doctorId, doctorId),
      eq(appointments.status, 'completed')
    ),
  });

  if (!completedAppointment) {
    return {
      error: 'You can only review doctors after a completed appointment',
    };
  }

  // Check if the patient has already reviewed this doctor
  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.patientId, patient.id),
      eq(reviews.doctorId, doctorId)
    ),
  });

  if (existingReview) {
    // Update the existing review
    await db
      .update(reviews)
      .set({
        rating,
        comment,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reviews.id, existingReview.id));

    revalidatePath(`/patient/search/${doctorId}`);
    return { success: true, message: 'Review updated successfully' };
  }

  const reviewId = nanoid();

  await db.insert(reviews).values({
    id: reviewId,
    patientId: patient.id,
    doctorId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath(`/patient/search/${doctorId}`);
  return { success: true, message: 'Review submitted successfully' };
}
