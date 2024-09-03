import { DoctorPatients } from '@components/doctor-patients';
import { fetchPaginatedPatients } from '@lib/server';
import { getSession } from '@lib/session';
import { getUserAndDoctor } from '@lib/utils';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

const Patients = async ({
  searchParams,
}: {
  searchParams?: {
    page?: string;
  };
}) => {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const userAndDoctor = await getUserAndDoctor(session.userId);
  const currentPage = Number(searchParams?.page) || 1;
  const startTime = performance.now();
  const { patients, totalPages, totalPatients } = await fetchPaginatedPatients(
    userAndDoctor.doctorId,
    currentPage
  );
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(
    `fetchPaginatedPatients execution time: ${executionTime.toFixed(2)} ms`
  );

  return (
    <div>
      <DoctorPatients
        patients={patients}
        currentPage={currentPage}
        totalPages={totalPages}
        totalPatients={totalPatients}
      />
    </div>
  );
};

export default Patients;
