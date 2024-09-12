import { TotalEarningsCard } from '@components/total-earnings-card';
import { getDoctorTotalEarnings } from '@lib/server';

export const TotalEarnings = async ({ doctorId }: { doctorId: string }) => {
  const earnings = await getDoctorTotalEarnings(doctorId);

  return (
    <div>
      <TotalEarningsCard earnings={earnings} />
    </div>
  );
};
