import { relations, sql } from 'drizzle-orm';
import {
  foreignKey,
  int,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').notNull().primaryKey(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    role: text('role', { enum: ['patient', 'doctor'] }).notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    avatar: text('avatar').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  table => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

export const doctors = sqliteTable(
  'doctors',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('userId').notNull().unique(),
    specialization: text('specialization').notNull(),
    yearsOfExperience: int('yearsOfExperience').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    startTime: text('startTime').notNull(), // Store as 'HH:MM:SS'
    endTime: text('endTime').notNull(), // Store as 'HH:MM:SS'
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    timezone: text('timezone').notNull(), // e.g., 'Europe/Paris'
  },
  doctors => ({
    doctors_user_fkey: foreignKey({
      name: 'doctors_user_fkey',
      columns: [doctors.userId],
      foreignColumns: [users.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

export const patients = sqliteTable(
  'patients',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('userId').notNull().unique(),
    bloodType: text('bloodType').notNull(),
    gender: text('gender').notNull(),
    genoType: text('genoType').notNull(),
    birthDate: text('birthDate').notNull(),
    occupation: text('occupation').notNull(),
    mobileNumber: text('mobileNumber').notNull(),
    address: text('address').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    timezone: text('timezone').notNull(), // e.g., 'Europe/Paris'
  },
  patients => ({
    patients_user_fkey: foreignKey({
      name: 'patients_user_fkey',
      columns: [patients.userId],
      foreignColumns: [users.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

export const appointments = sqliteTable(
  'appointments',
  {
    id: text('id').notNull().primaryKey(),
    patientId: text('patientId').notNull(),
    doctorId: text('doctorId').notNull(),
    appointmentStart: text('appointmentStart').notNull(), // Store as UTC ISO 8601: '2023-05-18T14:30:00Z'
    appointmentEnd: text('appointmentEnd').notNull(), // Store as UTC ISO 8601: '2023-05-18T15:30:00Z'
    status: text('status').notNull().default('pending'),
    roomName: text('roomName'),
    doctorToken: text('doctorToken'),
    patientToken: text('patientToken'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  appointments => ({
    appointments_patient_fkey: foreignKey({
      name: 'appointments_patient_fkey',
      columns: [appointments.patientId],
      foreignColumns: [patients.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    appointments_doctor_fkey: foreignKey({
      name: 'appointments_doctor_fkey',
      columns: [appointments.doctorId],
      foreignColumns: [doctors.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    appointmentStartIdx: index('appointments_start_idx').on(
      appointments.appointmentStart
    ),
    patientDoctorIdx: index('appointments_patient_doctor_idx').on(
      appointments.patientId,
      appointments.doctorId
    ),
  })
);

export const surgeries = sqliteTable(
  'surgeries',
  {
    id: text('id').notNull().primaryKey(),
    patientId: text('patientId').notNull(),
    doctorId: text('doctorId').notNull(),
    surgeryTime: text('surgeryTime').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  surgeries => ({
    surgeries_patient_fkey: foreignKey({
      name: 'surgeries_patient_fkey',
      columns: [surgeries.patientId],
      foreignColumns: [patients.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    surgeries_doctor_fkey: foreignKey({
      name: 'surgeries_doctor_fkey',
      columns: [surgeries.doctorId],
      foreignColumns: [doctors.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
);

export const patientNotifications = sqliteTable(
  'patient_notifications',
  {
    id: text('id').notNull().primaryKey(),
    patientId: text('patientId').notNull(),
    message: text('message').notNull(),
    isRead: int('isRead', { mode: 'boolean' }).notNull(),
    type: text('type').notNull(),
    appointmentId: text('appointmentId'),
    appointmentStartTime: text('appointmentStartTime'),
    appointmentEndTime: text('appointmentEndTime'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  patientNotifications => ({
    patient_notifications_patient_fkey: foreignKey({
      name: 'patient_notifications_patient_fkey',
      columns: [patientNotifications.patientId],
      foreignColumns: [patients.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    patient_notifications_appointment_fkey: foreignKey({
      name: 'patient_notifications_appointment_fkey',
      columns: [patientNotifications.appointmentId],
      foreignColumns: [appointments.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    patientIdIdx: index('patient_notifications_patient_idx').on(
      patientNotifications.patientId
    ),
    isReadIdx: index('patient_notifications_is_read_idx').on(
      patientNotifications.isRead
    ),
  })
);

export const doctorNotifications = sqliteTable(
  'doctor_notifications',
  {
    id: text('id').notNull().primaryKey(),
    doctorId: text('doctorId').notNull(),
    message: text('message').notNull(),
    isRead: int('isRead', { mode: 'boolean' }).notNull(),
    type: text('type').notNull(),
    appointmentId: text('appointmentId'),
    appointmentStartTime: text('appointmentStartTime'),
    appointmentEndTime: text('appointmentEndTime'),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  doctorNotifications => ({
    doctor_notifications_doctor_fkey: foreignKey({
      name: 'doctor_notifications_doctor_fkey',
      columns: [doctorNotifications.doctorId],
      foreignColumns: [doctors.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    doctor_notifications_appointment_fkey: foreignKey({
      name: 'doctor_notifications_appointment_fkey',
      columns: [doctorNotifications.appointmentId],
      foreignColumns: [appointments.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    doctorIdIdx: index('doctor_notifications_doctor_idx').on(
      doctorNotifications.doctorId
    ),
    isReadIdx: index('doctor_notifications_is_read_idx').on(
      doctorNotifications.isRead
    ),
  })
);

export const patientDoctors = sqliteTable(
  'patient_doctors',
  {
    id: text('id').notNull().primaryKey(),
    patientId: text('patientId').notNull(),
    doctorId: text('doctorId').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  patientDoctors => ({
    patient_doctors_patient_fkey: foreignKey({
      name: 'patient_doctors_patient_fkey',
      columns: [patientDoctors.patientId],
      foreignColumns: [patients.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    patient_doctors_doctor_fkey: foreignKey({
      name: 'patient_doctors_doctor_fkey',
      columns: [patientDoctors.doctorId],
      foreignColumns: [doctors.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    patientDoctors_patientId_doctorId_unique_idx: uniqueIndex(
      'patientDoctors_patientId_doctorId_key'
    ).on(patientDoctors.patientId, patientDoctors.doctorId),
  })
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').notNull().primaryKey(),
    userId: text('userId').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
    updatedAt: text('updatedAt')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  sessions => ({
    sessions_user_fkey: foreignKey({
      name: 'sessions_user_fkey',
      columns: [sessions.userId],
      foreignColumns: [users.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    sessions_userId_idx: uniqueIndex('sessions_userId_idx').on(sessions.userId),
  })
);

export const patientRegistrations = sqliteTable('patient_registrations', {
  id: text('id').notNull().primaryKey(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: ['patient', 'doctor'] }).notNull(),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  updatedAt: text('updatedAt')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});

export const usersRelations = relations(users, ({ many }) => ({
  doctor: many(doctors, {
    relationName: 'doctorsTousers',
  }),
  patient: many(patients, {
    relationName: 'patientsTousers',
  }),
  sessions: many(sessions, {
    relationName: 'usersToSessions',
  }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    relationName: 'doctorsTousers',
    fields: [doctors.userId],
    references: [users.id],
  }),
  appointments: many(appointments, {
    relationName: 'appointmentsTodoctors',
  }),
  surgeries: many(surgeries, {
    relationName: 'doctorsTosurgeries',
  }),
  patientDoctors: many(patientDoctors, {
    relationName: 'doctorsTopatientDoctors',
  }),
  doctorNotifications: many(doctorNotifications, {
    relationName: 'doctorNotificationsTodoctors',
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    relationName: 'patientsTousers',
    fields: [patients.userId],
    references: [users.id],
  }),
  appointments: many(appointments, {
    relationName: 'appointmentsTopatients',
  }),
  surgeries: many(surgeries, {
    relationName: 'patientsTosurgeries',
  }),
  patientDoctors: many(patientDoctors, {
    relationName: 'patientDoctorsTopatients',
  }),
  patientNotifications: many(patientNotifications, {
    relationName: 'patientNotificationsTopatients',
  }),
}));

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    patient: one(patients, {
      relationName: 'appointmentsTopatients',
      fields: [appointments.patientId],
      references: [patients.id],
    }),
    doctor: one(doctors, {
      relationName: 'appointmentsTodoctors',
      fields: [appointments.doctorId],
      references: [doctors.id],
    }),
    patientNotifications: many(patientNotifications, {
      relationName: 'appointmentsTopatientNotifications',
    }),
    doctorNotifications: many(doctorNotifications, {
      relationName: 'appointmentsTodoctorNotifications',
    }),
  })
);

export const surgeriesRelations = relations(surgeries, ({ one }) => ({
  patient: one(patients, {
    relationName: 'patientsTosurgeries',
    fields: [surgeries.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    relationName: 'doctorsTosurgeries',
    fields: [surgeries.doctorId],
    references: [doctors.id],
  }),
}));

export const patientNotificationsRelations = relations(
  patientNotifications,
  ({ one }) => ({
    patient: one(patients, {
      relationName: 'patientNotificationsTopatients',
      fields: [patientNotifications.patientId],
      references: [patients.id],
    }),
    appointment: one(appointments, {
      relationName: 'appointmentsTopatientNotifications',
      fields: [patientNotifications.appointmentId],
      references: [appointments.id],
    }),
  })
);

export const doctorNotificationsRelations = relations(
  doctorNotifications,
  ({ one }) => ({
    doctor: one(doctors, {
      relationName: 'doctorNotificationsTodoctors',
      fields: [doctorNotifications.doctorId],
      references: [doctors.id],
    }),
    appointment: one(appointments, {
      relationName: 'appointmentsTodoctorNotifications',
      fields: [doctorNotifications.appointmentId],
      references: [appointments.id],
    }),
  })
);

export const patientDoctorsRelations = relations(patientDoctors, ({ one }) => ({
  patient: one(patients, {
    relationName: 'patientDoctorsTopatients',
    fields: [patientDoctors.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    relationName: 'doctorsTopatientDoctors',
    fields: [patientDoctors.doctorId],
    references: [doctors.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    relationName: 'usersToSessions',
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
