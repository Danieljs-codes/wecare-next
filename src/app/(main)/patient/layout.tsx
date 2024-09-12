import { ReactNode } from 'react';
import { PatientLayout as PatientDashboardLayout } from '@components/patient-layout';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import {
  getPatientNotificationsWithDoctorDetails,
  getUserAndPatient,
} from '@lib/server';

export const runtime = 'edge';

async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || !session?.userId) {
    redirect('/sign-in');
  }

  const userAndPatient = await getUserAndPatient(session.userId);

  if (!userAndPatient || !userAndPatient.patientId) {
    redirect('/sign-in');
  }

  const notifications = await getPatientNotificationsWithDoctorDetails(
    userAndPatient.patientId
  );

  return (
    <div>
      <PatientDashboardLayout
        avatar={userAndPatient.avatar}
        name={`${userAndPatient.firstName} ${userAndPatient.lastName}`}
        notifications={notifications}
      >
        {children}
      </PatientDashboardLayout>
    </div>
  );
}

export default PatientLayout;
