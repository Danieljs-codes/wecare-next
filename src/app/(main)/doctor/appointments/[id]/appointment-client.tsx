'use client';

import { MediaRoom } from '@/components/media-room';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface AppointmentClientProps {
  appointmentId: string;
}

export function AppointmentClient({ appointmentId }: AppointmentClientProps) {
  const router = useRouter();

  const handleCallEnd = useCallback(() => {
    router.push('/doctor/appointments');
  }, [router]);

  return (
    <div className="h-[600px]">
      <MediaRoom
        chatId={appointmentId}
        video={true}
        audio={true}
        onCallEnd={handleCallEnd}
      />
    </div>
  );
}
