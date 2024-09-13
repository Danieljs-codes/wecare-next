'use server';

import { getSession } from '@lib/session';
import { db } from '@server/db';
import {
  users,
  doctors,
  payments,
  patientDoctors,
  appointments,
  patientNotifications,
  doctorNotifications,
} from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { stripe } from '@lib/stripe';

export const handleSuccessfulPayment = async (sessionId: string) => {
  const authSession = await getSession();

  if (!authSession) {
    return {
      error: 'Session expired',
    };
  }

  if (authSession.user.role !== 'patient') {
    return {
      error: 'You are not authorized to access this page',
    };
  }

  if (!sessionId) {
    return {
      error: 'Session ID not found',
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, authSession.user.id),
    with: {
      patient: true,
    },
  });

  if (!user || user.patient.length === 0) {
    return {
      error: 'Patient not found',
    };
  }

  const patient = user.patient[0];

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return {
      error: 'Payment not completed',
    };
  }

  const {
    patientId,
    doctorId,
    appointmentStart,
    appointmentEnd,
    reasonForAppointment,
  } = session.metadata as {
    patientId: string;
    doctorId: string;
    appointmentStart: string;
    appointmentEnd: string;
    reasonForAppointment: string;
  };

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
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
    return {
      error: 'Doctor not found',
    };
  }

  if (patient.id !== patientId) {
    return {
      error: 'Patient ID mismatch. Please try again.',
    };
  }

  // Check if this session has already been processed
  const existingPayment = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, session.payment_intent as string),
  });

  if (existingPayment) {
    return {
      error: 'This payment has already been processed',
    };
  }

  // Check if the session is still valid (e.g., not older than 1 hour)
  const sessionCreatedAt = new Date(session.created * 1000);
  if (new Date().getTime() - sessionCreatedAt.getTime() > 60 * 60 * 1000) {
    return {
      error: 'Session has expired',
    };
  }

  const appointmentId = nanoid();
  const notificationId = nanoid();
  const paymentId = nanoid();
  const doctorNotificationId = nanoid();
  const patientDoctorId = nanoid();

  const existingRelationship = await db.query.patientDoctors.findFirst({
    where: and(
      eq(patientDoctors.patientId, patientId),
      eq(patientDoctors.doctorId, doctorId)
    ),
  });

  let patientDoctorInsert;
  if (!existingRelationship) {
    patientDoctorInsert = db.insert(patientDoctors).values({
      id: patientDoctorId,
      patientId,
      doctorId,
    });
  }

  await db.batch([
    db.insert(appointments).values({
      id: appointmentId,
      patientId,
      doctorId,
      appointmentStart,
      appointmentEnd,
      status: 'confirmed',
      reason: reasonForAppointment,
      notes: '',
      initiatedBy: 'patient',
    }),

    db.insert(patientNotifications).values({
      id: notificationId,
      patientId,
      message: `Your appointment with Dr. ${
        doctor.user.firstName
      } is scheduled for ${DateTime.fromISO(appointmentStart, { zone: 'utc' })
        .setZone(patient.timezone)
        .toLocaleString({
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        })}.`,
      isRead: false,
      type: 'appointment_created',
      appointmentId,
      appointmentStartTime: appointmentStart,
      appointmentEndTime: appointmentEnd,
    }),

    db.insert(doctorNotifications).values({
      id: doctorNotificationId,
      doctorId,
      message: `New appointment scheduled with ${user.firstName} ${
        user.lastName
      } for ${DateTime.fromISO(appointmentStart, { zone: 'utc' })
        .setZone(doctor.timezone)
        .toLocaleString({
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        })}.`,
      isRead: false,
      type: 'general',
      appointmentId,
      appointmentStartTime: appointmentStart,
      appointmentEndTime: appointmentEnd,
    }),

    db.insert(payments).values({
      id: paymentId,
      appointmentId,
      amount: session.amount_total ?? 0,
      stripePaymentIntentId: session.payment_intent as string,
    }),

    ...(patientDoctorInsert ? [patientDoctorInsert] : []),
  ]);

  return {
    success: true,
    message: 'Appointment booked successfully',
    appointmentId,
  };
};
