import { getDoctorAppointments, getDoctorWithReviews, searchDoctors } from './server';

export type Appointment = Awaited<
  ReturnType<typeof getDoctorAppointments>
>[0];

export type Appointments = Appointment[];

export type Doctor = Awaited<ReturnType<typeof searchDoctors>>[0];

export type DoctorWithReviews = NonNullable<Awaited<
  ReturnType<typeof getDoctorWithReviews>
>>;
