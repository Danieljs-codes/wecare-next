import { DoctorAppointments } from '@components/doctor-appointments';
import { getDoctorAppointments } from '@lib/server';
import { getSession } from '@lib/session';
import { getUserAndDoctor } from '@lib/utils';
import { redirect } from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const Appointments = async ({
  searchParams,
}: {
  searchParams?: {
    date?: string;
  };
}) => {
  const defaultDate = new Date();
  const date = searchParams?.date ? new Date(searchParams.date) : defaultDate;

  if (isNaN(date.getTime())) {
    redirect('/doctor/appointments');
  }

  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  if (!userAndDoctor) {
    redirect('/sign-in');
  }

  // Use the adjusted date for fetching appointments
  const appointments = await getDoctorAppointments(
    userAndDoctor.doctorId,
    date
  );

  console.log(appointments);

  return (
    <div>
      <DoctorAppointments appointments={appointments} />
    </div>
  );
};

export default Appointments;
