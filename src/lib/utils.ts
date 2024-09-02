import { getLocalTimeZone } from '@internationalized/date';
import { db } from '@server/db';
import { doctors, users } from '@server/db/schema';
import clsx, { ClassValue } from 'clsx';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { cache } from 'react';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function getUserTimezone() {
  // Get the IANA timezone identifier
  const timezone = getLocalTimeZone();

  return timezone;
}

/**
 * Fetches user and doctor information based on the provided userId.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} The user and doctor information.
 *
 * @remarks
 * This function should only be used in server components, server actions, and route handlers.
 */

export const getUserAndDoctor = cache(async (userId: string) => {
  const [userAndDoctor] = await db
    .select({
      userId: users.id,
      userRole: users.role,
      doctorId: doctors.id,
      avatar: users.avatar,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .leftJoin(doctors, eq(doctors.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (
    !userAndDoctor ||
    userAndDoctor.userRole !== 'doctor' ||
    !userAndDoctor.doctorId
  ) {
    redirect('/sign-in');
  }

  return {
    ...userAndDoctor,
    doctorId: userAndDoctor.doctorId as string,
  };
});
