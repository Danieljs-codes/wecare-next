import { faker } from '@faker-js/faker';
import { db } from './db';
import { users, doctors, patients } from './db/schema';
import { nanoid } from 'nanoid';
import { hashPassword } from '@lib/password';

const NUM_DOCTORS = 100;

async function seedDoctors() {
  console.log('🌱 Seeding doctors...');

  for (let i = 0; i < NUM_DOCTORS; i++) {
    const userId = nanoid();
    const doctorId = nanoid();
    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();
    const email = faker.internet.email({
      firstName,
      lastName,
      provider: 'gmail.com',
    });
    const password = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;

    // Create user entry
    await db.insert(users).values({
      id: userId,
      firstName,
      lastName,
      role: 'doctor',
      email: email.toLowerCase(),
      password: await hashPassword(password),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });

    // Create corresponding doctor entry
    await db.insert(doctors).values({
      id: doctorId,
      userId: userId,
      specialization: faker.helpers.arrayElement([
        'cardiology',
        'dermatology',
        'endocrinology',
        'gastroenterology',
        'neurology',
        'oncology',
        'pediatrics',
        'psychiatry',
        'radiology',
        'surgery',
        'urology',
        'orthopedics',
        'ophthalmology',
        'gynecology',
        'anesthesiology',
      ]),
      yearsOfExperience: faker.number.int({ min: 5, max: 40 }),
      createdAt: faker.date.past().toISOString(),
      startTime: faker.date.future().toISOString(),
      endTime: faker.date.future().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      timezone: faker.location.timeZone().toLowerCase(),
      bio: faker.person.bio(),
      price: faker.number.int({ min: 5000, max: 50000 }),
      country: faker.location.country().toLowerCase(),
    });
  }

  console.log('✅ Doctors seeded successfully!');
}

seedDoctors().catch(console.error);

const NUM_PATIENTS = 100;

async function seedPatients() {
  console.log('🌱 Seeding patients...');

  for (let i = 0; i < NUM_PATIENTS; i++) {
    const userId = nanoid();
    const patientId = nanoid();
    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();
    const email = faker.internet.email({ firstName, lastName });
    const password = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;

    // Create user entry
    await db.insert(users).values({
      id: userId,
      firstName,
      lastName,
      role: 'patient',
      email,
      password: await hashPassword(password),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    });

    // Create corresponding patient entry
    await db.insert(patients).values({
      id: patientId,
      userId: userId,
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
      gender: faker.person.sex().toLowerCase(),
      genoType: faker.helpers.arrayElement(['AA', 'AS', 'SS']),
      birthDate: faker.date
        .birthdate({ min: 18, max: 80, mode: 'age' })
        .toISOString(),
      occupation: faker.person.jobTitle().toLowerCase(),
      mobileNumber: faker.phone.number(),
      address: faker.location.streetAddress(true),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      timezone: faker.location.timeZone().toLowerCase(),
    });
  }

  console.log('✅ Patients seeded successfully!');
}

seedPatients().catch(console.error);
