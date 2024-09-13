'use server';

import { getSession } from '@lib/session';
import { db } from '@server/db';
import {
  users,
  appointments,
  doctors,
  doctorNotifications,
} from '@server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export type RescheduleAppointmentSchema = {
  appointmentId: string;
  appointmentStart: string;
  doctorId: string;
};

export async function rescheduleAppointment({
  appointmentId,
  appointmentStart: newAppointmentStartDate,
  doctorId,
}: RescheduleAppointmentSchema) {
  // Some defensive programming here to ensure the appointment exists and is not already rescheduled

  const session = await getSession();

  if (!session) {
    return {
      error: 'Session expired',
      success: false as const,
    };
  }

  if (session.user.role !== 'patient') {
    return {
      error: 'You are not authorized to access this page',
      success: false as const,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      patient: true,
    },
  });

  if (!user || user.patient.length === 0) {
    return {
      error: 'Patient not found',
      success: false as const,
    };
  }

  const patient = user.patient[0];

  if (!appointmentId) {
    return {
      error: 'Appointment ID is required',
      success: false as const,
    };
  }

  // Validate appointment exists and hasn't been cancelled
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
    with: {
      patient: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!appointment) {
    return {
      error: 'Appointment not found',
      success: false as const,
    };
  }

  if (appointment.status === 'cancelled') {
    return {
      error: 'Cannot reschedule a cancelled appointment',
      success: false as const,
    };
  }

  const appointmentStart = DateTime.fromISO(
    appointment.appointmentStart
  ).setZone('utc');
  const appointmentEnd = DateTime.fromISO(appointment.appointmentEnd).setZone(
    'utc'
  );

  if (appointmentStart < DateTime.now()) {
    return {
      error: 'Appointment has already passed',
      success: false as const,
    };
  }

  // Check if appointment is 24 hours or less away (User cannot reschedule appointments within 24 hours)
  const timeUntilAppointment = appointmentStart
    .diff(DateTime.now())
    .as('hours');
  if (timeUntilAppointment < 24) {
    return {
      error: 'Appointment cannot be rescheduled within 24 hours',
      success: false as const,
    };
  }

  // Check if appointment has been rescheduled more than twice
  if (appointment.rescheduleCount >= 2) {
    return {
      error: 'Appointment has already been rescheduled twice',
      success: false as const,
    };
  }

  // Validate appointment start time
  const newAppointmentStart = DateTime.fromISO(newAppointmentStartDate).setZone(
    'utc'
  );
  const newAppointmentEnd = newAppointmentStart.plus({
    minutes: appointmentEnd.diff(appointmentStart).as('minutes'),
  });

  // Check for overlapping appointments
  const overlappingAppointment = await db.query.appointments.findFirst({
    where: sql`
      ${eq(appointments.doctorId, doctorId)}
      AND ${appointments.id} != ${appointmentId}
      AND ${appointments.appointmentStart} < ${newAppointmentEnd.toISO()}
      AND ${appointments.appointmentEnd} > ${newAppointmentStart.toISO()}
    `,
  });

  if (overlappingAppointment) {
    return {
      error: 'The selected time overlaps with an existing appointment',
      success: false as const,
    };
  }

  // Validate the patient rescheduled for at least 1 hour after the original appointment
  // if (newAppointmentStart < appointmentStart.plus({ hours: 1 })) {
  //   return {
  //     error:
  //       'Appointment cannot be rescheduled for less than 1 hour after the original appointment',
  //     success: false as const,
  //   };
  // }

  // Validate the doctor doesn't have an appointment scheduled for the new appointment start time
  // Validate if appointmentDateTime falls into doctor's working hours
  const doctorWorkingHours = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
    columns: {
      startTime: true,
      endTime: true,
      timezone: true,
    },
  });

  if (!doctorWorkingHours) {
    return {
      error: "Unable to retrieve doctor's working hours",
      success: false as const,
    };
  }

  const { startTime, endTime, timezone } = doctorWorkingHours;

  // Convert appointment time to doctor's timezone
  const appointmentInDoctorTz = newAppointmentStart.setZone(timezone);

  // Parse doctor's working hours
  const doctorStartTime = DateTime.fromISO(startTime, { zone: timezone });
  const doctorEndTime = DateTime.fromISO(endTime, { zone: timezone });

  // Set the date of doctorStartTime and doctorEndTime to the appointment date
  const startDateTime = appointmentInDoctorTz.set({
    hour: doctorStartTime.hour,
    minute: doctorStartTime.minute,
    second: 0,
    millisecond: 0,
  });
  const endDateTime = appointmentInDoctorTz.set({
    hour: doctorEndTime.hour,
    minute: doctorEndTime.minute,
    second: 0,
    millisecond: 0,
  });

  // Check if the appointment time is within the doctor's working hours
  if (
    appointmentInDoctorTz < startDateTime ||
    appointmentInDoctorTz >= endDateTime
  ) {
    return {
      error:
        "The selected appointment time is outside of the doctor's working hours",
    };
  }

  const doctorNotificationId = nanoid();

  await db.batch([
    db
      .update(appointments)
      .set({
        rescheduleCount: appointment.rescheduleCount + 1,
        appointmentStart: newAppointmentStart.toISO()!,
        appointmentEnd: newAppointmentEnd.toISO()!,
        updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
      })
      .where(eq(appointments.id, appointmentId)),

    db.insert(doctorNotifications).values({
      id: doctorNotificationId,
      doctorId,
      message: `Your appointment with ${user.firstName} ${
        user.lastName
      } has been rescheduled for ${DateTime.fromISO(
        newAppointmentStart.toISO()!,
        { zone: 'utc' }
      )
        .setZone(patient.timezone)
        .toLocaleString(DateTime.DATETIME_FULL)}.`,
      isRead: false,
      type: 'general',
      appointmentId,
      appointmentStartTime: newAppointmentStart.toISO()!,
      appointmentEndTime: appointmentEnd.toISO()!,
    }),
  ]);

  revalidatePath('/patient/appointments');
  return { success: true as const };
}
