import { getLocalTimeZone } from '@internationalized/date';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function getUserTimezone() {
  // Get the IANA timezone identifier
  const timezone = getLocalTimeZone();

  return timezone;
}
