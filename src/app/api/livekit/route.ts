import { AccessToken } from 'livekit-server-sdk';
import { getSession } from '@lib/session';
import { db } from '@server/db';
import { eq, and } from 'drizzle-orm';
import { appointments, doctors, patients } from '@server/db/schema';
import { DateTime } from 'luxon';

export const runtime = 'edge';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) return new Response('Unauthorized', { status: 401 });

  const { role, id: userId } = session.user;
  const userQuery = role === 'doctor' ? db.query.doctors : db.query.patients;
  const user = await userQuery.findFirst({
    where: eq(role === 'doctor' ? doctors.userId : patients.userId, userId),
    columns: { id: true },
  });

  if (!user) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room');
  const username = searchParams.get('username');

  if (!room || !username)
    return new Response('Missing room or username', { status: 400 });

  // Validate appointment
  const appointment = await db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, room),
      eq(
        role === 'doctor' ? appointments.doctorId : appointments.patientId,
        user.id
      )
    ),
  });

  if (!appointment)
    return new Response('Appointment not found or unauthorized', {
      status: 404,
    });

  const now = DateTime.utc();
  const appointmentStart = DateTime.fromISO(appointment.appointmentStart, {
    zone: 'utc',
  });
  const appointmentEnd = DateTime.fromISO(appointment.appointmentEnd, {
    zone: 'utc',
  });
  const tenMinutesBeforeStart = appointmentStart.minus({ minutes: 10 });
  const tenMinutesAfterEnd = appointmentEnd.plus({ minutes: 10 });

  if (now < tenMinutesBeforeStart)
    return new Response('Appointment not started yet', { status: 400 });

  const {
    LIVEKIT_API_KEY: apiKey,
    LIVEKIT_API_SECRET: apiSecret,
    NEXT_PUBLIC_LIVEKIT_URL: wsUrl,
  } = process.env;

  if (!apiKey || !apiSecret || !wsUrl) {
    return new Response('Server misconfigured', { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    ttl: Math.max(0, tenMinutesAfterEnd.toSeconds() - now.toSeconds()),
  });

  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  return Response.json({ token });
}
