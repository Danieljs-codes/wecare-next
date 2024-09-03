import 'server-only';

/**
 * Fetches user and doctor information based on the provided userId.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} The user and doctor information.
 *
 * @remarks
 * This function should only be used in server components, server actions, and route handlers.
 */

import { db } from '@server/db';
import {
  appointments,
  doctors,
  patientDoctors,
  patients,
  users,
} from '@server/db/schema';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cache } from 'react';

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

export const fetchDoctorAppointments = async (
  doctorId: string,
  date: Date,
  limit?: number
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let query = db
    .select({
      appointmentId: appointments.id,
      appointmentStart: appointments.appointmentStart,
      appointmentEnd: appointments.appointmentEnd,
      patientId: patients.id,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      patientEmail: users.email,
      patientBloodType: patients.bloodType,
      patientGender: patients.gender,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentStart, startOfDay.toISOString()),
        lt(appointments.appointmentStart, endOfDay.toISOString())
      )
    )
    .orderBy(appointments.appointmentStart)
    .limit(5);

  const result = await query;

  return result;
};

export async function fetchPaginatedPatients(
  doctorId: string,
  page: number,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;

  const doctorPatients = await db
    .select({
      patientId: patients.id,
      patientName: users.firstName,
      patientLastName: users.lastName,
      bloodType: patients.bloodType,
      gender: patients.gender,
      genoType: patients.genoType,
      birthDate: patients.birthDate,
      occupation: patients.occupation,
      mobileNumber: patients.mobileNumber,
      address: patients.address,
      email: users.email,
      relationshipCreatedAt: patientDoctors.createdAt,
    })
    .from(patientDoctors)
    .innerJoin(patients, eq(patientDoctors.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .where(eq(patientDoctors.doctorId, doctorId))
    .orderBy(desc(patientDoctors.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patientDoctors)
    .where(eq(patientDoctors.doctorId, doctorId));

  const totalPatients = count;

  const totalPages = Math.ceil(count / pageSize);

  return { patients: doctorPatients, totalPages, totalPatients };
}
