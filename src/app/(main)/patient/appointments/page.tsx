import { redirect } from 'next/navigation';
import { handleSuccessfulPayment } from '../search/[id]/action';

export const runtime = 'edge';

export default async function PatientAppointments({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  if (searchParams.session_id) {
    const result = await handleSuccessfulPayment(searchParams.session_id);
    if (result.success) {
      redirect('/patient/dashboard');
    } else {
      // Show error message
    }
  }

  // Rest of the appointments page code...

  return (
    <div>Ola</div>
  )
}
