import { ReactNode } from 'react';
import { DoctorLayout as DoctorDashboardLayout } from '@components/doctor-layout';
import { db } from '@server/db';
import { doctorNotifications, doctors, users } from '@server/db/schema';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getUserAndDoctor } from '@lib/utils';

export const runtime = 'edge';

const DoctorLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  if (!session || !session?.userId) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  // Fetch all doctor notifications
  const notifications = await db.query.doctorNotifications.findMany({
    where: eq(doctorNotifications.doctorId, userAndDoctor.doctorId),
    orderBy: (doctors, { desc }) => [desc(doctors.createdAt)],
  });

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
