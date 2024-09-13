"use server"

import { clearSession } from "@lib/session";
import { revalidatePath } from "next/cache";

export const logout = async () => {
  await clearSession();
  revalidatePath('/');
  return { success: true, message: 'Logged out successfully' };
};
