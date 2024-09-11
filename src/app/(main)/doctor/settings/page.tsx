import { DoctorSettings } from '@components/doctor-settings';
import { clearSession, getSession } from '@lib/session';
import { db } from '@server/db';
import { doctors } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

const Settings = async () => {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'doctor') {
    redirect('/sign-in');
  }

  // Fetch user and doctor
  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.userId, session.user.id),
    with: {
      user: true,
    },
  });

  if (!doctor) {
    // Valid session but no doctor found in the database (should never happen) the only case this would happen is if we manually deleted the user from the database
    clearSession();
    redirect('/sign-in');
  }

  return (
    <div>
      <DoctorSettings doctorInfo={doctor} />
    </div>
  );
};
export default Settings;
