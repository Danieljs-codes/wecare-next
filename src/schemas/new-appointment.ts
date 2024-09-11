import { getLocalTimeZone, now, ZonedDateTime } from '@internationalized/date';
import { z } from 'zod';

export const newAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentDateTime: z
    .custom<ZonedDateTime>(val => val instanceof ZonedDateTime, {
      message: 'Invalid date and time',
    })
    .refine(
      val => {
        const currentTime = now(getLocalTimeZone());
        const oneHourLater = currentTime.add({ hours: 1 });
        return val.compare(oneHourLater) >= 0;
      },
      {
        message: 'Appointment must be at least 1 hour from now',
      }
    ),
  appointmentDuration: z.enum(['30', '60', '90', '120', '150', '180'], {
    required_error: 'Select a duration',
    message: 'Invalid Duration',
  }),
  reasonForAppointment: z.string().min(1, 'Reason for appointment is required'),
});

export type NewAppointmentSchema = z.infer<typeof newAppointmentSchema>;

export const patientInitiatedAppointmentSchema = newAppointmentSchema
  .omit({
    patientId: true,
  })
  .extend({
    doctorId: z.string().min(1, 'Patient ID is required'),
  });

export type PatientInitiatedAppointmentSchema = z.infer<
  typeof patientInitiatedAppointmentSchema
>;

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string(),
  appointmentStart: z
    .custom<ZonedDateTime>(val => val instanceof ZonedDateTime, {
      message: 'Invalid date and time',
    })
    .refine(
      val => {
        const currentTime = now(getLocalTimeZone());
        const oneHourLater = currentTime.add({ hours: 1 });
        return val.compare(oneHourLater) >= 0;
      },
      {
        message: 'Appointment must be at least 1 hour from now',
      }
    ),
  doctorId: z.string(),
});

export type RescheduleAppointmentSchema = z.infer<
  typeof rescheduleAppointmentSchema
>;

export const doctorSettingsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  price: z
    .number({
      invalid_type_error: 'Please choose a valid price',
    })
    .positive('Price must be positive'),
  specialization: z.string().min(1, 'Specialization is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});
