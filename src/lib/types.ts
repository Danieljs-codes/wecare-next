import { getDoctorAppointmentsForDay } from './server';

export type Appointment = Awaited<
  ReturnType<typeof getDoctorAppointmentsForDay>
>[0];

export type Appointments = Appointment[];
