import {
  getDoctorAppointments,
  getDoctorWithReviews,
  getPatientAppointmentsWithDoctorInfo,
  searchDoctors,
} from './server';

export type Appointment = Awaited<ReturnType<typeof getDoctorAppointments>>[0];

export type Appointments = Appointment[];

export type Doctor = Awaited<ReturnType<typeof searchDoctors>>[0];

export type DoctorWithReviews = NonNullable<
  Awaited<ReturnType<typeof getDoctorWithReviews>>
>;

export type PatientAppointments = Awaited<
  ReturnType<typeof getPatientAppointmentsWithDoctorInfo>
>;

export type DoctorNotifications = {
  id: string;
  createdAt: string;
  doctorId: string;
  appointmentId: string | null;
  message: string;
  isRead: boolean;
  type: 'general' | 'refund';
  appointmentStartTime: string | null;
  appointmentEndTime: string | null;
};
