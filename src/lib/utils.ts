import { getLocalTimeZone } from '@internationalized/date';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function getUserTimezone() {
  // Get the IANA timezone identifier
  const timezone = getLocalTimeZone();

  return timezone;
}


export const searchParamsCache = createSearchParamsCache({
  specialization: parseAsString,
  minExperience: parseAsInteger,
  maxExperience: parseAsInteger,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  startTime: parseAsString,
  endTime: parseAsString,
  name: parseAsString,
  timezone: parseAsString,
});

export const convertCentsToDollars = (cents: number) => {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? dollars.toString() : dollars.toFixed(2);
};
