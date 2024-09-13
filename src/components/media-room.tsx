import { useEffect, useState, useCallback } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  onCallEnd: () => void; // New prop for handling call end
}

export const MediaRoom = ({
  chatId,
  video,
  audio,
  onCallEnd,
}: MediaRoomProps) => {
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${chatId}`
        );
        const data = (await response.json()) as { token: string };
        setToken(data.token);
      } catch (error) {
        toast.error('Something went wrong');
      }
    };

    fetchToken();
  }, [chatId, router]);

  const handleDisconnect = useCallback(() => {
    onCallEnd();
    toast.info('You have left the call');
  }, [onCallEnd]);

  if (token === '') {
    return <div>Loading...</div>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      video={video}
      audio={audio}
      onDisconnected={handleDisconnect}
      options={{
        disconnectOnPageLeave: true,
      }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
