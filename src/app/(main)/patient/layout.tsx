import { ReactNode } from 'react';
import { PatientLayout as PatientDashboardLayout } from '@components/patient-layout';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import { getUserAndPatient } from '@lib/server';

export const runtime = 'edge';

async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || !session?.userId) {
    redirect('/sign-in');
  }

  const userAndPatient = await getUserAndPatient(session.userId);

  return (
    <div>
      <PatientDashboardLayout
        avatar={userAndPatient.avatar}
        name={`${userAndPatient.firstName} ${userAndPatient.lastName}`}
      >
        {children}
      </PatientDashboardLayout>
    </div>
  );
}

export default PatientLayout;
