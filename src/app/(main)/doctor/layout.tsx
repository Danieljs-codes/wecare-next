import { ReactNode } from 'react';
import { DoctorLayout as DoctorDashboardLayout } from '@components/doctor-layout';
import { db } from '@server/db';
import { doctors, users } from '@server/db/schema';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const DoctorLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  if (!session || !session?.userId) {
    redirect('/sign-in');
  }

  // Fetch user and doctor with session.userId
  const [userAndDoctor] = await db
    .select({
      userId: users.id,
      userRole: users.role,
      doctorId: doctors.id,
      avatar: users.avatar,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .leftJoin(doctors, eq(doctors.userId, users.id))
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!userAndDoctor) {
    redirect('/sign-in');
  }

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
