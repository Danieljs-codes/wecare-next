import { db } from '@server/db';
import { appointments, patientDoctors, patients } from '@server/db/schema';
import { TotalPatientCard } from '@components/total-patients-card';
import { sql } from 'drizzle-orm';

export async function TotalPatients({
  doctorId,
  days,
}: {
  doctorId: string;
  days: 7 | 14 | 30;
}) {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const result = await db
    .select({
      totalPatients: sql<number>`count(distinct ${patientDoctors.patientId})`,
      newPatients: sql<number>`coalesce(sum(case when ${patients.createdAt} >= ${sevenDaysAgo} then 1 else 0 end), 0)`,
    })
    .from(patientDoctors)
    .innerJoin(patients, sql`${patientDoctors.patientId} = ${patients.id}`)
    .where(sql`${patientDoctors.doctorId} = ${doctorId}`);

  const { totalPatients, newPatients } = result[0] || {
    totalPatients: 0,
    newPatients: 0,
  };

  console.log(totalPatients, newPatients);

  const percentageIncrease = (() => {
    if (totalPatients === 0) return 0;
    if (totalPatients === newPatients) return 100; // 100% increase when all patients are new
    return Math.min(
      (newPatients / (totalPatients - newPatients) - 1) * 100,
      100
    );
  })();

  return (
    <TotalPatientCard
      totalPatients={totalPatients}
      newPatients={newPatients}
      percentageIncrease={percentageIncrease}
      days={days}
    />
  );
}
