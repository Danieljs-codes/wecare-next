import { getDoctorAppointments, searchDoctors } from './server';

export type Appointment = Awaited<
  ReturnType<typeof getDoctorAppointments>
>[0];

export type Appointments = Appointment[];

export type Doctor = Awaited<ReturnType<typeof searchDoctors>>[0];
