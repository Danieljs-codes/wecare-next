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

  console.log(result[0]);

  const percentageIncrease =
    totalPatients > 0 ? (newPatients / (totalPatients - newPatients)) * 100 : 0;

  return (
    <TotalPatientCard
      totalPatients={totalPatients}
      newPatients={newPatients}
      percentageIncrease={percentageIncrease}
      days={days}
    />
  );
}
