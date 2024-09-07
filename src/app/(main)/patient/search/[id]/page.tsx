import { getDoctorWithReviews } from '@lib/server';
import { notFound, redirect } from 'next/navigation';

const DoctorDetails = async ({ params }: { params: { id: string } }) => {
  const doctorWithReviews = await getDoctorWithReviews(params.id);

  if (!doctorWithReviews) {
    notFound();
  }

  return (
    <div>
      <div>DoctorDetails</div>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
};
export default DoctorDetails;
