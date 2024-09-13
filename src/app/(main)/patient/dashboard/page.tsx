import { PatientDashboard as PatientDashboardOverview } from '@components/patient-dashboard';
import {
  getPatientAppointmentCounts,
  getPatientCancelledAppointmentCount,
  getPatientTotalSpending,
  getPatientUpcomingAppointmentCount,
} from '@lib/server';
import { getSession } from '@lib/session';
import { db } from '@server/db';
import { patients } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
export const runtime = 'edge';

const PatientDashboard = async () => {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'patient') {
    redirect('/sign-in');
  }

  const patient = await db.query.patients.findFirst({
    where: eq(patients.userId, session.user.id),
    columns: {
      id: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          firstName: true,
        },
      },
    },
  });

  if (!patient) {
    redirect('/sign-in');
  }

  const [
    totalSpending,
    patientAppointmentCounts,
    cancelledAppointments,
    upcomingAppointments,
  ] = await Promise.all([
    getPatientTotalSpending(patient.id),
    getPatientAppointmentCounts(patient.id),
    getPatientCancelledAppointmentCount(patient.id),
    getPatientUpcomingAppointmentCount(patient.id),
  ]);

  return (
    <div>
      <PatientDashboardOverview
        totalSpending={totalSpending}
        name={patient.user.firstName}
        totalAppointments={patientAppointmentCounts.totalAppointments}
        upcomingAppointments={upcomingAppointments}
        cancelledAppointments={cancelledAppointments}
        totalUpcomingAppointments={
          patientAppointmentCounts.upcomingAppointments
        }
      />
    </div>
  );
};
export default PatientDashboard;
