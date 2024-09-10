'use server';

import { patientInitiatedAppointmentSchema } from '@/schemas/new-appointment';
import { clearSession, getSession } from '@lib/session';
import { db } from '@server/db';
import {
  doctors,
  users,
  appointments,
  patientNotifications,
  payments,
  doctorNotifications,
} from '@server/db/schema';
import { eq, and, gte, lte, or, gt, lt } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DateTime } from 'luxon';
import { stripe } from '@lib/stripe';
import { nanoid } from 'nanoid';

// We are omitting appointmentDateTime because it is a class and we can't pass that over the wire since it isn't serializable
const createAppointmentSchema = patientInitiatedAppointmentSchema
  .omit({
    appointmentDateTime: true,
  })
  .extend({
    appointmentDateTime: z.string().refine(
      value => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && value === date.toISOString();
      },
      {
        message: 'Invalid UTC ISO 8601 string',
      }
    ),
  });

export const bookAppointment = async (
  input: z.infer<typeof createAppointmentSchema>
) => {
  const data = createAppointmentSchema.safeParse(input);

  console.log(input);

  if (!data.success) {
    console.log(data.error.message);
    return {
      error: data.error.message,
    };
  }

  const {
    doctorId,
    appointmentDateTime,
    appointmentDuration,
    reasonForAppointment,
  } = data.data;

  // Validate patient is logged in
  const session = await getSession();
  if (!session) {
    redirect('/sign-in');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      patient: true,
    },
  });

  if (!user || user.patient.length === 0 || user.role !== 'patient') {
    // Since there is a valid session but not a valid user, we clear the session and redirect to sign-in
    clearSession();
    redirect('/sign-in');
  }

  const patient = user.patient[0];

  // Validate if doctorId sent is a valid doctor
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
      error: 'The selected doctor does not exist in our system',
    };
  }

  // Validate if appointmentDateTime is a valid date
  const appointmentDate = DateTime.fromISO(appointmentDateTime, {
    zone: 'utc',
  });
  if (!appointmentDate.isValid) {
    return {
      error: 'The provided appointment date and time is invalid',
    };
  }

  // Validate if appointmentDuration is a valid number
  const appointmentDurationNumber = parseInt(appointmentDuration);
  if (isNaN(appointmentDurationNumber)) {
    return {
      error: 'The appointment duration must be a valid number',
    };
  }

  // Validate appointment duration (minimum 15 minutes, maximum 120 minutes)

  const minDuration = 30;
  const maxDuration = 180;
  const intervalDuration = 30;

  if (
    appointmentDurationNumber < minDuration ||
    appointmentDurationNumber > maxDuration ||
    appointmentDurationNumber % intervalDuration !== 0
  ) {
    return {
      error: `Appointment duration must be between ${minDuration} minutes and ${
        maxDuration / 60
      } hours`,
    };
  }

  // Validate if appointment start time is in 30-minute intervals
  const appointmentMinutes = appointmentDate.minute;
  if (appointmentMinutes % intervalDuration !== 0) {
    return {
      error: `Appointment start time must be in ${intervalDuration}-minute intervals`,
    };
  }

  // Validate if appointmentDateTime is not in the past
  if (appointmentDate < DateTime.utc()) {
    return {
      error: 'The appointment date and time must be in the future',
    };
  }

  // Validate if appointment is not too far in the future (e.g., 6 months)
  const maxAdvanceBookingDays = 180; // 6 months
  if (appointmentDate > DateTime.utc().plus({ days: maxAdvanceBookingDays })) {
    return {
      error: `Appointments can only be booked up to ${maxAdvanceBookingDays} days in advance`,
    };
  }

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
    };
  }

  const { startTime, endTime, timezone } = doctorWorkingHours;

  // Convert appointment time to doctor's timezone
  const appointmentInDoctorTz = appointmentDate.setZone(timezone);

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

  // Convert appointment start and end times back to UTC for storage
  const appointmentStartUtc = appointmentInDoctorTz.toUTC();
  const appointmentEndUtc = appointmentStartUtc.plus({
    minutes: appointmentDurationNumber,
  });

  // Check for overlapping appointments
  const appointmentStartIso = appointmentStartUtc.toISO();
  const appointmentEndIso = appointmentEndUtc.toISO();

  if (!appointmentStartIso || !appointmentEndIso) {
    return {
      error: 'Unable to process the appointment date range',
    };
  }

  const overlappingAppointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.doctorId, doctorId),
      or(
        and(
          lte(appointments.appointmentStart, appointmentStartIso),
          gt(appointments.appointmentEnd, appointmentStartIso)
        ),
        and(
          lt(appointments.appointmentStart, appointmentEndIso),
          gte(appointments.appointmentEnd, appointmentEndIso)
        ),
        and(
          gte(appointments.appointmentStart, appointmentStartIso),
          lte(appointments.appointmentEnd, appointmentEndIso)
        )
      )
    ),
  });

  if (overlappingAppointment) {
    return {
      error: 'The selected time slot is already booked',
    };
  }

  // If all validations pass, create a Stripe Checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Doctor Appointment',
            description: `Appointment with Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
            images: [doctor.user.avatar],
          },
          unit_amount: Math.round(
            (doctor.price / 60) * appointmentDurationNumber
          ), // Calculate price based on appointment duration
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/patient/appointments?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/patient/search/${doctorId}`,
    metadata: {
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentStart: appointmentStartIso,
      appointmentEnd: appointmentEndIso,
      reasonForAppointment,
    },
  });

  if (!stripeSession.url) {
    return {
      error: 'Failed to create payment session',
    };
  }

  return {
    success: true,
    message: 'Redirecting to payment',
    paymentUrl: stripeSession.url,
  };
};

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

  if (patient.id !== patientId) {
    return {
      error: 'Patient ID mismatch. Please try again.',
    };
  }

  const appointmentId = nanoid();
  const notificationId = nanoid();
  const paymentId = nanoid();
  const doctorNotificationId = nanoid();

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
        user.firstName
      } is scheduled for ${DateTime.fromISO(appointmentStart, { zone: 'utc' })
        .setZone(patient.timezone)
        .toLocaleString(DateTime.DATETIME_FULL)}.`,
      isRead: false,
      type: 'appointment_created',
      appointmentId,
      appointmentStartTime: appointmentStart,
      appointmentEndTime: appointmentEnd,
    }),

    db.insert(doctorNotifications).values({
      id: doctorNotificationId,
      doctorId,
      message: `Your appointment with Dr. ${
        user.firstName
      } is scheduled for ${DateTime.fromISO(appointmentStart, { zone: 'utc' })
        .setZone(patient.timezone)
        .toLocaleString(DateTime.DATETIME_FULL)}.`,
      isRead: false,
      type: 'appointment_created',
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
  ]);

  return {
    success: true,
    message: 'Appointment booked successfully',
    appointmentId,
  };
};
