import { users, patients, appointments, patientDoctors } from './schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { db } from '.';

// Helper function to generate a random date within the last 30 days
function getRandomDateWithinLast30Days() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const randomDate = new Date(now.setDate(now.getDate() - daysAgo));
  return randomDate;
}

export async function seed() {
  // Insert 100 users
  const userIds = [];
  for (let i = 0; i < 100; i++) {
    const userId = faker.datatype.uuid();
    userIds.push(userId);
    await db.insert(users).values({
      id: userId,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      role: 'patient',
      email: faker.internet.email(),
      password: faker.internet.password(),
      avatar: faker.image.avatar(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Insert patients
  const patientIds = [];
  for (const userId of userIds) {
    const patientId = faker.datatype.uuid();
    patientIds.push(patientId);
    await db.insert(patients).values({
      id: patientId,
      userId,
      bloodType: faker.helpers.arrayElement([
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
      ]),
      gender: faker.helpers.arrayElement(['male', 'female']),
      genoType: faker.helpers.arrayElement(['AA', 'AS', 'SS']),
      birthDate: faker.date.past(30).toISOString(),
      occupation: faker.name.jobTitle(),
      mobileNumber: faker.phone.number(),
      address: faker.address.streetAddress(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timezone: faker.address.timeZone(),
    });
  }

  // Insert appointments and patientDoctors for a specific doctor
  const doctorId = 'nSQfvBX-_G0Em6K4zUJPd';
  for (const patientId of patientIds) {
    const appointmentId = faker.datatype.uuid();
    const patientDoctorId = faker.datatype.uuid();

    const appointmentStart = getRandomDateWithinLast30Days();
    const appointmentEnd = new Date(appointmentStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    await db.insert(appointments).values({
      id: appointmentId,
      patientId,
      doctorId,
      appointmentStart: appointmentStart.toISOString(),
      appointmentEnd: appointmentEnd.toISOString(),
      status: 'pending',
      roomName: faker.random.word(),
      doctorToken: faker.datatype.uuid(),
      patientToken: faker.datatype.uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.insert(patientDoctors).values({
      id: patientDoctorId,
      patientId,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

seed()
  .then(() => {
    console.log('Seeding completed.');
  })
  .catch(error => {
    console.error('Seeding failed:', error);
  });
