import { getSession } from '@lib/session';
import { getUserAndDoctor } from '@lib/utils';
import { redirect } from 'next/navigation';
import { AppointmentClient } from './appointment-client';
import { db } from '@server/db';
import { appointments } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { IconCalendar } from 'justd-icons';
import { RedirectButton } from '@components/redirect-button';
import { DateTime } from 'luxon';

export const runtime = 'edge';

export default async function DoctorAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  if (!userAndDoctor || userAndDoctor.userRole !== 'doctor') {
    redirect('/sign-in');
  }

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, params.id),
  });

  if (!appointment || appointment.doctorId !== userAndDoctor.doctorId) {
    redirect('/doctor/appointments');
  }

  const now = DateTime.now();
  const appointmentStart = DateTime.fromISO(appointment.appointmentStart);
  const appointmentEnd = DateTime.fromISO(appointment.appointmentEnd);

  if (now > appointmentEnd || appointment.status === 'cancelled') {
    redirect('/doctor/appointments');
  }

  if (now < appointmentStart) {
    const timeUntilAppointment = appointmentStart.diff(now);
    const hours = timeUntilAppointment.as('hours');
    const minutes = timeUntilAppointment.as('minutes') % 60;

    let timeDisplay = '';
    if (hours >= 1) {
      timeDisplay = `${Math.floor(hours)} hour${
        hours >= 2 ? 's' : ''
      } and ${Math.floor(minutes)} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      timeDisplay = `${Math.floor(minutes)} minute${minutes !== 1 ? 's' : ''}`;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <IconCalendar className="size-10 text-primary mb-4" />
        <h1 className="text-xl text-gray-800 dark:text-gray-200 font-bold mb-3">
          Your appointment is coming up soon
        </h1>
        <p className="text-base mb-2 font-medium text-muted-fg">
          Time until your appointment: {timeDisplay}
        </p>
        <p className="text-sm text-muted-fg mb-4">
          Please join at {appointmentStart.toFormat('MMM d yyyy, h:mm a')}
        </p>
        <RedirectButton path="/doctor/appointments">
          Go to Appointments
        </RedirectButton>
      </div>
    );
  }

  return (
    <div>
      <AppointmentClient appointmentId={params.id} />
    </div>
  );
}
