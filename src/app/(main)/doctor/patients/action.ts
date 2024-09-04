'use server';

import {
  NewAppointmentSchema,
  newAppointmentSchema,
} from '@/schemas/new-appointment';
import { getSession } from '@lib/session';
import { getUserAndDoctor } from '@lib/utils';
import { db } from '@server/db';
import {
  appointments,
  doctors,
  patientNotifications,
  patients,
  users,
} from '@server/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { z } from 'zod';

type NewAppointmentSchemaWithZonedDateTime = {
  patientId: string;
  appointmentDateTime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
    timeZone: string;
  };
  appointmentDuration: string;
  reasonForAppointment: string;
};

export async function createAppointmentByDoctor(
  input: NewAppointmentSchemaWithZonedDateTime
) {
  console.log(input);
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  if (!userAndDoctor) {
    redirect('/sign-in');
  }

  const doctorId = userAndDoctor.doctorId;

  const validatedInput = newAppointmentSchema
    .extend({
      appointmentDateTime: z.object({
        year: z.number(),
        month: z.number(),
        day: z.number(),
        hour: z.number(),
        minute: z.number(),
        second: z.number(),
        millisecond: z.number(),
        timeZone: z.string(),
      }),
    })
    .safeParse(input);
  if (!validatedInput.success) {
    return { error: validatedInput.error.message };
  }

  const {
    patientId,
    appointmentDateTime,
    appointmentDuration,
    reasonForAppointment,
  } = validatedInput.data;

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });

  if (!patient) {
    return { error: 'Patient not found' };
  }

  const appointmentStart = DateTime.fromObject(
    {
      year: appointmentDateTime.year,
      month: appointmentDateTime.month,
      day: appointmentDateTime.day,
      hour: appointmentDateTime.hour,
      minute: appointmentDateTime.minute,
      second: appointmentDateTime.second,
      millisecond: appointmentDateTime.millisecond,
    },
    { zone: appointmentDateTime.timeZone }
  )
    .toUTC()
    .toISO();

  if (!appointmentStart) {
    return { error: 'Invalid appointment start' };
  }

  const appointmentEnd = DateTime.fromObject(appointmentDateTime)
    .plus({ minutes: parseInt(appointmentDuration) })
    .toUTC()
    .toISO();

  if (!appointmentEnd) {
    return { error: 'Invalid appointment end' };
  }

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
  });

  if (!doctor) {
    return { error: 'Doctor not found' };
  }

  const doctorStartTime = DateTime.fromISO(doctor.startTime, {
    zone: doctor.timezone,
  });
  const doctorEndTime = DateTime.fromISO(doctor.endTime, {
    zone: doctor.timezone,
  });

  const appointmentStartLocal = DateTime.fromISO(appointmentStart).setZone(
    doctor.timezone
  );
  const appointmentEndLocal = DateTime.fromISO(appointmentEnd).setZone(
    doctor.timezone
  );

  if (
    appointmentStartLocal < doctorStartTime ||
    appointmentEndLocal > doctorEndTime
  ) {
    return {
      error: "Appointment is outside of doctor's working hours",
    };
  }

  const overlappingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.doctorId, doctorId),
      lt(appointments.appointmentStart, appointmentEnd),
      gte(appointments.appointmentEnd, appointmentStart)
    ),
  });

  if (overlappingAppointments.length > 0) {
    return {
      error:
        'This time slot is already booked. Please choose a different time.',
    };
  }

  const patientAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.patientId, patientId),
      lt(appointments.appointmentStart, appointmentEnd),
      gte(appointments.appointmentEnd, appointmentStart)
    ),
  });

  if (patientAppointments.length > 0) {
    return {
      error: 'Patient already has an appointment at this time',
    };
  }

  const appointmentId = nanoid();
  const notificationId = nanoid();

  await db.batch([
    db.insert(appointments).values({
      id: appointmentId,
      patientId,
      doctorId,
      appointmentStart,
      appointmentEnd,
      status: 'confirmed',
    }),

    db.insert(patientNotifications).values({
      id: notificationId,
      patientId,
      message: `Your appointment with Dr. ${
        userAndDoctor.lastName
      } is scheduled for ${appointmentStartLocal.toFormat(
        'MMMM d, yyyy'
      )} at ${appointmentStartLocal.toFormat(
        'h:mm a'
      )}. Please arrive 10 minutes early.`,
      isRead: false,
      type: 'appointment_created',
      appointmentId,
      appointmentStartTime: appointmentStart,
      appointmentEndTime: appointmentEnd,
    }),
  ]);

  return {
    appointmentId,
    success: true,
    message: 'Appointment created successfully',
  };
}
