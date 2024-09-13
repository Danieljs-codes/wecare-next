import { getPatientRegistrationDetails } from '@/app/(auth)/sign-up/action';
import { getSession } from '@lib/session';
import { db } from '@server/db';
import { users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

const Dashboard = async () => {
  const session = await getSession();

  if (!session) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!user) redirect('/sign-in');

  if (user.role === 'doctor') {
    redirect('/doctor/dashboard');
  } else if (user.role === 'patient') {
    redirect('/patient/dashboard');
  } else {
    redirect('/sign-in');
  }
};
export default Dashboard;
