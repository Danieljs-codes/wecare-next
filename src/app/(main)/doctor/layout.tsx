import { ReactNode } from 'react';
import { DoctorLayout as DoctorDashboardLayout } from '@components/doctor-layout';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import { getUserAndDoctor } from '@lib/server';
import { getDoctorNotificationsWithPatientDetails } from '@lib/server';

export const runtime = 'edge';

const DoctorLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  if (!session || !session?.userId) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  // Fetch all doctor notifications
  const notifications = await getDoctorNotificationsWithPatientDetails(
    userAndDoctor.doctorId
  );

  return (
    <div>
      <DoctorDashboardLayout
        avatar={userAndDoctor.avatar}
        name={`${userAndDoctor.firstName} ${userAndDoctor.lastName}`}
        notifications={notifications}
      >
        {children}
      </DoctorDashboardLayout>
    </div>
  );
};

export default DoctorLayout;
