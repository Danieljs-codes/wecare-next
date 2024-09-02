import { db } from '@server/db';
import { appointments } from '@server/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export const AppointmentsToday = async ({ doctorId }: { doctorId: string }) => {
  const result = await db
  .select({
    count: sql<number>`cast(count(*) as integer)`,
  })
  .from(appointments)
  .where(
    and(
      eq(appointments.doctorId, doctorId),
      sql`date(${appointments.appointmentStart}) = date('now')`
    )
  );

const appointmentCount = result[0].count;

  return <div>AppointmentsToday</div>;
};
