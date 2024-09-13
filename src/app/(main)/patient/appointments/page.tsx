import { redirect } from 'next/navigation';
import { PatientAppointment } from '@components/patients-appointment';
import { getSession } from '@lib/session';
import { db } from '@server/db';
import { users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { getPatientAppointmentsWithDoctorInfo } from '@lib/server';
import { handleSuccessfulPayment } from '@/actions/handle-successful-payment';

export const runtime = 'edge';

export default async function PatientAppointments({
  searchParams,
}: {
  searchParams: {
    session_id?: string;
    filter?: string;
    appointmentId?: string;
    name?: string;
    page?: string;
    pageSize?: string;
  };
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'patient') {
    redirect('/sign-in');
  }

  const patient = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      patient: true,
    },
  });

  if (!patient || patient.patient.length === 0) {
    redirect('/sign-in');
  }

  if (searchParams.session_id) {
    const result = await handleSuccessfulPayment(searchParams.session_id);
    if (result.success) {
      return redirect(
        `/patient/appointments?appointmentId=${result.appointmentId}`
      );
    } else {
    }
  }

  let filterType = 'all';
  if (searchParams.filter === 'past') {
    filterType = 'past';
  } else if (searchParams.filter === 'upcoming') {
    filterType = 'upcoming';
  }

  const appointments = await getPatientAppointmentsWithDoctorInfo({
    patientId: patient.patient[0].id,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : 10,
    filterType: filterType as 'past' | 'upcoming' | 'all',
    name: searchParams.name,
  });

  console.log(appointments);

  return (
    <div>
      <PatientAppointment appointments={appointments} />
    </div>
  );
}
