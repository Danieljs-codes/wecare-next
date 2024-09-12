import { SearchPage } from '@components/search-page';
import { searchDoctors, SearchParams } from '@lib/server';
import { getSession } from '@lib/session';
import { searchParamsCache } from '@lib/utils';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function Search({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'patient') {
    redirect('/sign-in');
  }

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
    </div>
  );
}
