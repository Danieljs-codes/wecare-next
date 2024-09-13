'use server';

import { clearSession, getSession } from '@lib/session';
import { db } from '@server/db';
import { appointments, patients, users } from '@server/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const deletePatientAccount = async () => {
  const session = await getSession();

  if (!session) {
    return { success: false as const, message: 'No active session found' };
  }

  const patient = await db.query.patients.findFirst({
    where: eq(patients.userId, session.user.id),
    columns: {
      id: true,
    },
  });

  if (!patient) {
    await clearSession();
    return { success: false as const, message: 'No patient found' };
  }

  // Check for upcoming appointments
  const upcomingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.patientId, patient.id),
      gt(appointments.appointmentStart, new Date().toISOString())
    ),
  });

  if (upcomingAppointments.length > 0) {
    return {
      success: false as const,
      message: 'Cannot delete account with upcoming appointments',
    };
  }

  // Delete the user
  try {
    await db.delete(users).where(eq(users.id, session.user.id));
    await clearSession();
    revalidatePath('/');
    return { success: true as const, message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false as const,
      message: 'An error occurred while deleting the account',
    };
  }
};
