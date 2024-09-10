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
  payments,
  reviews,
  users,
} from '@server/db/schema';
import {
  and,
  between,
  desc,
  eq,
  gte,
  isNull,
  like,
  lt,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { DateTime } from 'luxon';

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

export async function getDoctorAppointments(doctorId: string, date: Date) {
  // Ensure the input date is treated as UTC
  const startOfDayUTC = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const endOfDayUTC = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  const doctorAppointments = await db
    .select({
      appointmentId: appointments.id,
      appointmentStart: appointments.appointmentStart,
      appointmentEnd: appointments.appointmentEnd,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      initiatedBy: appointments.initiatedBy,
      doctorId: doctors.id,
      doctorSpecialization: doctors.specialization,
      patientId: patients.id,
      patientFirstName: users.firstName,
      patientLastName: users.lastName,
      patientEmail: users.email,
      patientBloodType: patients.bloodType,
      patientGender: patients.gender,
      patientBirthDate: patients.birthDate,
      patientMobileNumber: patients.mobileNumber,
      paymentAmount: payments.amount,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(users, eq(patients.userId, users.id))
    .leftJoin(payments, eq(appointments.id, payments.appointmentId))
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentStart, startOfDayUTC.toISOString()),
        lt(appointments.appointmentStart, endOfDayUTC.toISOString()),
        or(
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'cancelled'),
          eq(appointments.status, 'completed'),
          eq(appointments.status, 'no_show')
        )
      )
    )
    .orderBy(appointments.appointmentStart);

  return doctorAppointments;
}

export async function getUserAndPatient(userId: string) {
  const [userAndPatient] = await db
    .select({
      userId: users.id,
      userRole: users.role,
      patientId: patients.id,
      avatar: users.avatar,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .leftJoin(patients, eq(users.id, patients.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!userAndPatient || userAndPatient.userRole !== 'patient') {
    redirect('/sign-in');
  }

  return userAndPatient;
}

export interface SearchParams {
  specialization?: string;
  minExperience?: number;
  maxExperience?: number;
  minPrice?: number;
  maxPrice?: number;
  startTime?: string;
  endTime?: string;
  name?: string;
  timezone?: string;
}

export async function searchDoctors(params: SearchParams) {
  const {
    specialization,
    minExperience,
    maxExperience,
    minPrice,
    maxPrice,
    startTime,
    endTime,
    name,
    // Most people that will use it are in Nigeria since it uses just one timezone which is `GMT +1` We can set that as the default
    timezone = 'Africa/Lagos',
  } = params;

  let query = db
    .select({
      doctorId: doctors.id,
      userId: doctors.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      specialization: doctors.specialization,
      yearsOfExperience: doctors.yearsOfExperience,
      price: doctors.price,
      startTime: doctors.startTime,
      endTime: doctors.endTime,
      timezone: doctors.timezone,
      bio: doctors.bio,
      avatar: users.avatar,
    })
    .from(doctors)
    .innerJoin(users, eq(doctors.userId, users.id));

  const conditions = [];

  if (specialization && specialization !== 'all') {
    conditions.push(eq(doctors.specialization, specialization));
  }

  if (minExperience !== undefined && maxExperience !== undefined) {
    conditions.push(
      between(doctors.yearsOfExperience, minExperience, maxExperience)
    );
  } else if (minExperience !== undefined) {
    conditions.push(gte(doctors.yearsOfExperience, minExperience));
  } else if (maxExperience !== undefined) {
    conditions.push(lte(doctors.yearsOfExperience, maxExperience));
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    conditions.push(between(doctors.price, minPrice, maxPrice));
  } else if (minPrice !== undefined) {
    conditions.push(gte(doctors.price, minPrice));
  } else if (maxPrice !== undefined) {
    conditions.push(lte(doctors.price, maxPrice));
  }

  if (startTime || endTime) {
    let startTimeUTC, endTimeUTC;

    if (startTime) {
      startTimeUTC = DateTime.fromFormat(startTime, 'HH:mm', {
        zone: timezone,
      })
        .toUTC()
        .toFormat('HH:mm:ss');
    }

    if (endTime) {
      endTimeUTC = DateTime.fromFormat(endTime, 'HH:mm', {
        zone: timezone,
      })
        .toUTC()
        .toFormat('HH:mm:ss');
    }

    if (startTimeUTC && endTimeUTC) {
      conditions.push(
        and(
          sql`time(substr(${doctors.startTime}, 12, 8)) <= time(${startTimeUTC})`,
          sql`time(substr(${doctors.endTime}, 12, 8)) >= time(${endTimeUTC})`
        )
      );
    } else if (startTimeUTC) {
      conditions.push(
        sql`time(substr(${doctors.startTime}, 12, 8)) <= time(${startTimeUTC})`
      );
    } else if (endTimeUTC) {
      conditions.push(
        sql`time(substr(${doctors.endTime}, 12, 8)) <= time(${endTimeUTC})`
      );
    }
  }

  if (name) {
    conditions.push(
      or(like(users.firstName, `%${name}%`), like(users.lastName, `%${name}%`))
    );
  }

  if (conditions.length > 0) {
    // @ts-expect-error
    query = query.where(and(...conditions));
  }

  const results = await query.execute();

  return results;
}

export async function getDoctorWithReviews(doctorId: string) {
  const result = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
    with: {
      user: true,
      reviews: {
        with: {
          patient: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  return result;
}

export async function getPatientAppointmentsWithDoctorInfo({
  patientId,
  page = 1,
  pageSize = 10,
  filterType = 'all',
  name = '',
}: {
  patientId: string;
  page?: number;
  pageSize?: number;
  filterType?: 'past' | 'upcoming' | 'all';
  name?: string;
}) {
  const offset = (page - 1) * pageSize;
  const currentUtcTime = sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`;

  let timeFilter;
  switch (filterType) {
    case 'upcoming':
      timeFilter = gte(appointments.appointmentStart, currentUtcTime);
      break;
    case 'past':
      timeFilter = lt(appointments.appointmentStart, currentUtcTime);
      break;
    case 'all':
    default:
      timeFilter = sql`1=1`; // This will always be true, effectively not applying any time filter
  }

  let nameFilter = sql`1=1`; // Default to true if no name is provided
  if (name) {
    // @ts-expect-error
    nameFilter = or(
      like(users.firstName, `%${name}%`),
      like(users.lastName, `%${name}%`)
    );
  }

  const patientAppointments = await db
    .select({
      id: appointments.id,
      appointmentStart: appointments.appointmentStart,
      appointmentEnd: appointments.appointmentEnd,
      status: appointments.status,
      reason: appointments.reason,
      doctorId: appointments.doctorId,
      doctorFirstName: users.firstName,
      doctorLastName: users.lastName,
      doctorSpecialization: doctors.specialization,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(and(eq(appointments.patientId, patientId), timeFilter, nameFilter))
    .orderBy(desc(appointments.appointmentStart))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .where(and(eq(appointments.patientId, patientId), timeFilter, nameFilter));

  const totalAppointments = count;
  const totalPages = Math.ceil(totalAppointments / pageSize);

  return {
    appointments: patientAppointments,
    totalPages,
    totalAppointments,
    currentPage: page,
  };
}
