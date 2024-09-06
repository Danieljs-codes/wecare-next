import { getDoctorAppointments } from './server';

export type Appointment = Awaited<
  ReturnType<typeof getDoctorAppointments>
>[0];

export type Appointments = Appointment[];
