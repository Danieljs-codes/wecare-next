'use server';

import { seed } from '@server/db/seed';

export async function seedDB() {
  await seed();

  return {
    message: 'Database seeded successfully',
  };
}
