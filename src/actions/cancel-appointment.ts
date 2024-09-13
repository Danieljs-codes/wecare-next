'use server';

import { getSession } from '@lib/session';
import { stripe } from '@lib/stripe';
import { db } from '@server/db';
import {
  appointments,
  payments,
  patientNotifications,
  doctorNotifications,
} from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

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

  if (appointment.status === 'cancelled') {
    return {
      error: 'Appointment has already been cancelled',
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
        type: 'general',
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
