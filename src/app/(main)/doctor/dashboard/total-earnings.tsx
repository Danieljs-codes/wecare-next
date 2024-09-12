import { TotalEarningsCard } from '@components/total-earnings-card';
import { getDoctorTotalEarnings } from '@lib/server';
import { Badge } from '@ui/badge';
import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import { IconDotsHorizontal, IconMoneybag } from 'justd-icons';

export const TotalEarnings = async ({ doctorId }: { doctorId: string }) => {
  const earnings = await getDoctorTotalEarnings(doctorId);

  return (
    <div>
      <TotalEarningsCard earnings={earnings} />
    </div>
  );
};
