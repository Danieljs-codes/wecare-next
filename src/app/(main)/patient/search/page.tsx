import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
} from 'nuqs/server';
import { SearchPage } from '@components/search-page';

export const runtime = 'edge';

const searchParamsCache = createSearchParamsCache({
  specialization: parseAsString,
  minYearsOfExperience: parseAsInteger,
  maxYearsOfExperience: parseAsInteger,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  availableStartTime: parseAsString,
  availableEndTime: parseAsString,
  name: parseAsString,
});

const searchSchema = z.object({
  specialization: z.string().optional(),
  minYearsOfExperience: z.number().min(0).optional(),
  maxYearsOfExperience: z.number().min(0).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  availableStartTime: z.string().optional(),
  availableEndTime: z.string().optional(),
  name: z.string().optional(),
});

export default function Search({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsedParams = searchParamsCache.parse(searchParams);

  return (
    <div>
      <SearchPage />
      <pre>{JSON.stringify(parsedParams, null, 2)}</pre>
    </div>
  );
}
