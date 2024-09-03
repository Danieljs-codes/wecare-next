import { Grid } from '@ui/grid';
import hand from '@/assets/hand.png';
import { TotalVisitors } from './total-visitors';
import { getSession } from '@lib/session';
import { redirect } from 'next/navigation';
import { TotalPatients } from './total-patients';
import { db } from '@server/db';
import { patientDoctors, patients, users } from '@server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { PatientsTable } from '@/components/patients-table';
import { getUserAndDoctor } from '@lib/utils';
import { fetchDoctorAppointments } from '@lib/server';
import AppointmentsToday from '@components/appointments-today-table';
import { seedDB } from '../action';

export const runtime = 'edge';

async function Dashboard() {
  const session = await getSession();
  if (!session || !session.userId) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);

  const doctorPatients = await db
    .select({
      patientId: patients.id,
      patientName: users.firstName,
      patientLastName: users.lastName,
      bloodType: patients.bloodType,
      gender: patients.gender,
      genoType: patients.genoType,
      birthDate: patients.birthDate,
      occupation: patients.occupation,
      mobileNumber: patients.mobileNumber,
      address: patients.address,
      email: users.email,
      relationshipCreatedAt: patientDoctors.createdAt,
    })
    .from(patientDoctors)
    .innerJoin(patients, eq(patientDoctors.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .where(eq(patientDoctors.doctorId, userAndDoctor.doctorId))
    .orderBy(desc(patientDoctors.createdAt))
    .limit(5);

  const appointmentsToday = await fetchDoctorAppointments(
    userAndDoctor.doctorId,
    new Date(),
    5
  );

  return (
    <div className="space-y-6 lg:space-y-10">
      <div>
        <h1 className="font-semibold text-fg text-xl capitalize">
          Welcome back, Dr. Olamide
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hand.src}
            alt="hand"
            className="inline-block mb-1 size-[20px] ml-1"
            aria-hidden="true"
          />
        </h1>
        <p className="mt-2 text-muted-fg text-xs md:text-sm">
          Here is the latest update for your career. Check now
        </p>
      </div>
      <Grid columns={{ initial: 1, lg: 4 }} gap={{ initial: 4 }}>
        <TotalVisitors doctorId={userAndDoctor.doctorId} days={7} />
        <TotalPatients doctorId={userAndDoctor.doctorId} days={7} />
        <TotalVisitors doctorId={userAndDoctor.doctorId} days={7} />
        <TotalPatients doctorId={userAndDoctor.doctorId} days={7} />
      </Grid>
      <div>
        <PatientsTable patients={doctorPatients} />
      </div>
      <div>
        <AppointmentsToday appointments={appointmentsToday} />
      </div>
    </div>
  );
}

export default Dashboard;
