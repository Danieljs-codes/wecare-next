import { SearchPage } from '@components/search-page';
import { searchDoctors, SearchParams } from '@lib/server';
import { searchParamsCache } from '@lib/utils';

export const runtime = 'edge';

export default async function Search({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const parsedParams = searchParamsCache.parse(searchParams);

  // Convert null values to undefined to match the SearchParams type
  const sanitizedParams = Object.fromEntries(
    Object.entries(parsedParams).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  ) as SearchParams;

  const doctors = await searchDoctors(sanitizedParams);

  return (
    <div>
      <SearchPage doctors={doctors} />
      <pre>{JSON.stringify(parsedParams, null, 2)}</pre>
    </div>
  );
}
