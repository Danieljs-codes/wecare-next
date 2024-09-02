import 'server-only';

import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { db } from '@/server/db';
import { sessions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const SESSION_COOKIE_NAME = 'sessionId';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 1 day in seconds
  path: '/',
} satisfies Partial<ResponseCookie>;

async function storeSessionInDatabase(sessionId: string, userId: string) {
  await db.insert(sessions).values({
    id: sessionId,
    userId,
  });
}

async function getSessionFromDatabase(sessionId: string) {
  return await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: {
      user: {
        columns: {
          id: true,
          role: true,
        },
      },
    },
  });
}

async function removeSessionFromDatabase(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function createSession(userId: string) {
  const sessionId = nanoid();

  await storeSessionInDatabase(sessionId, userId);

  cookies().set(SESSION_COOKIE_NAME, sessionId, cookieOptions);
}

export async function getSession() {
  const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) return null;

  return await getSessionFromDatabase(sessionId);
}

export async function clearSession() {
  const sessionId = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await removeSessionFromDatabase(sessionId);
  }

  cookies().delete(SESSION_COOKIE_NAME);
}
