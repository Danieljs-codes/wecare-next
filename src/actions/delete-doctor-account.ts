'use server';

import { clearSession, getSession } from '@lib/session';
import { db } from '@server/db';
import { appointments, doctors, users } from '@server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { revalidatePath } from 'next/cache';

export const deleteDoctorAccount = async () => {
  const session = await getSession();

  if (!session) {
    return { success: false as const, message: 'No active session found' };
  }

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, session.user.id),
    columns: {
      id: true,
    },
  });

  if (!doctor) {
    await clearSession();
    return { success: false as const, message: 'No doctor found' };
  }

  // Check for upcoming appointments
  const upcomingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctorId, doctor.id),
      gt(appointments.appointmentStart, DateTime.utc().toISO())
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
