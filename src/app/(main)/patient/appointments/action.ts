'use server';

import { getSession } from '@lib/session';
import { stripe } from '@lib/stripe';
import { db } from '@server/db';
import {
  appointments,
  doctorNotifications,
  doctors,
  patientNotifications,
  payments,
  users,
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

  // Validate appointment exists
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
      type: 'appointment_rescheduled',
      appointmentId,
      appointmentStartTime: newAppointmentStart.toISO()!,
      appointmentEndTime: appointmentEnd.toISO()!,
    }),
  ]);

  revalidatePath('/patient/appointments');
  return { success: true as const };
}

export async function cancelAppointment(appointmentId: string) {
  const session = await getSession();

  if (!session) {
    return {
      error: 'Session expired',
      success: false as const,
    };
  }

  if (session.user.role !== 'patient') {
    return {
      error: 'You are not authorized to cancel this appointment',
      success: false as const,
    };
  }

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
    with: {
      patient: {
        with: {
          user: true,
        },
      },
      doctor: {
        with: {
          user: true,
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

  if (appointment.patient.userId !== session.user.id) {
    return {
      error: 'You are not authorized to cancel this appointment',
      success: false as const,
    };
  }

  const appointmentStart = DateTime.fromISO(appointment.appointmentStart);
  const now = DateTime.now();

  if (appointmentStart.diff(now, 'hours').hours <= 24) {
    return {
      error: 'Appointments cannot be cancelled within 24 hours',
      success: false as const,
    };
  }

  const payment = await db.query.payments.findFirst({
    where: eq(payments.appointmentId, appointmentId),
  });

  if (!payment) {
    return {
      error: 'Payment not found for this appointment',
      success: false as const,
    };
  }

  const refundAmount = Math.floor(payment.amount / 2);

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
    });

    const patientNotificationId = nanoid();
    const doctorNotificationId = nanoid();

    await db.batch([
      db
        .update(appointments)
        .set({
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appointments.id, appointmentId)),

      db
        .update(payments)
        .set({
          refundAmount,
          refundId: refund.id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(payments.id, payment.id)),

      db.insert(patientNotifications).values({
        id: patientNotificationId,
        patientId: appointment.patientId,
        message: `Your appointment with Dr. ${
          appointment.doctor.user.lastName
        } on ${appointmentStart.toFormat(
          'MMMM d, yyyy'
        )} at ${appointmentStart.toFormat(
          'h:mm a'
        )} has been cancelled. A 50% refund has been processed.`,
        isRead: false,
        type: 'appointment_cancelled',
        appointmentId,
        appointmentStartTime: appointment.appointmentStart,
        appointmentEndTime: appointment.appointmentEnd,
      }),

      db.insert(doctorNotifications).values({
        id: doctorNotificationId,
        doctorId: appointment.doctorId,
        message: `The appointment with ${appointment.patient.user.firstName} ${
          appointment.patient.user.lastName
        } on ${appointmentStart.toFormat(
          'MMMM d, yyyy'
        )} at ${appointmentStart.toFormat(
          'h:mm a'
        )} has been cancelled by the patient.`,
        isRead: false,
        type: 'appointment_cancelled',
        appointmentId,
        appointmentStartTime: appointment.appointmentStart,
        appointmentEndTime: appointment.appointmentEnd,
      }),
    ]);

    revalidatePath('/patient/appointments');
    return {
      success: true as const,
      message: 'Appointment cancelled successfully and refund processed.',
    };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return {
      error:
        'An error occurred while cancelling the appointment. Please try again.',
      success: false as const,
    };
  }
}
