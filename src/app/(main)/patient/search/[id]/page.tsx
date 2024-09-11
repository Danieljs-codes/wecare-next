import { DoctorInfo } from '@components/doctor-info';
import { getDoctorWithReviews } from '@lib/server';
import { getSession } from '@lib/session';
import { db } from '@server/db';
import { users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

export const runtime = 'edge';

const DoctorDetails = async ({ params }: { params: { id: string } }) => {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'patient') {
    redirect('/sign-in');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      role: true,
    },
    with: {
      patient: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!user || user.patient.length === 0) {
    redirect('/sign-in');
  }

  if (user.role !== 'patient') {
    redirect('/sign-in');
  }

  const patient = user.patient[0];

  const doctorWithReviews = await getDoctorWithReviews(params.id);

  if (!doctorWithReviews) {
    notFound();
  }

  return (
    <div>
      <DoctorInfo doctorInfo={doctorWithReviews} patientId={patient.id} />
    </div>
  );
};
export default DoctorDetails;
