import { db } from '@server/db';
import { appointments } from '@server/db/schema';
import { TotalVisitorsCard } from '@/components/total-visitors-card';
import { eq, sql } from 'drizzle-orm';

export async function TotalVisitors({
  doctorId,
  days,
}: {
  doctorId: string;
  days: 7 | 14 | 30;
}) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousStartDate = new Date(
    startDate.getTime() - days * 24 * 60 * 60 * 1000
  );
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const stats = await db
    .select({
      currentPeriodAppointments: sql<number>`COUNT(CASE WHEN ${
        appointments.appointmentStart
      } >= ${startDate.toISOString()} AND ${
        appointments.appointmentStart
      } < ${now.toISOString()} THEN 1 END)`,
      previousPeriodAppointments: sql<number>`COUNT(CASE WHEN ${
        appointments.appointmentStart
      } >= ${previousStartDate.toISOString()} AND ${
        appointments.appointmentStart
      } < ${startDate.toISOString()} THEN 1 END)`,
      todayAppointments: sql<number>`COUNT(CASE WHEN ${
        appointments.appointmentStart
      } >= ${todayStart.toISOString()} AND ${
        appointments.appointmentStart
      } < ${now.toISOString()} THEN 1 END)`,
    })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));

  const currentVisitors = stats[0]?.currentPeriodAppointments || 0;
  const previousVisitors = stats[0]?.previousPeriodAppointments || 0;
  const visitorsTodayCount = stats[0]?.todayAppointments || 0;
  const percentageChange =
    previousVisitors === 0
      ? currentVisitors > 0
        ? 100
        : 0
      : ((currentVisitors - previousVisitors) / previousVisitors) * 100;
  return (
    <TotalVisitorsCard
      currentVisitors={currentVisitors}
      previousVisitors={previousVisitors}
      visitorsTodayCount={visitorsTodayCount}
      percentageChange={percentageChange}
      days={days}
    />
  );
}
