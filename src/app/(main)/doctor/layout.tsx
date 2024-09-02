import { ReactNode } from 'react';
import { DoctorLayout as DoctorDashboardLayout } from '@components/doctor-layout';
import { db } from '@server/db';
import { doctors, users } from '@server/db/schema';
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

  return (
    <div>
      <DoctorDashboardLayout
        avatar={userAndDoctor.avatar}
        name={`${userAndDoctor.firstName} ${userAndDoctor.lastName}`}
      >
        {children}
      </DoctorDashboardLayout>
    </div>
  );
};

export default DoctorLayout;
