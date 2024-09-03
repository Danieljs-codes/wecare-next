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
  appointmentStart: z.object({
    hour: z
      .number()
      .min(0, 'Hour must be between 0 and 23')
      .max(23, 'Hour must be between 0 and 23'),
    minute: z
      .number()
      .min(0, 'Minute must be between 0 and 59')
      .max(59, 'Minute must be between 0 and 59'),
  }),
  appointmentDuration: z.enum(
    ['30', '60', '90', '120', '150', '180', '210', '240'],
    {
      required_error: 'Select a duration',
      message: 'Invalid Duration',
    }
  ),
  reasonForAppointment: z.string().min(1, 'Reason for appointment is required'),
});
