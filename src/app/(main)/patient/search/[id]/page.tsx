import { DoctorInfo } from '@components/doctor-info';
import { getDoctorWithReviews } from '@lib/server';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

const DoctorDetails = async ({ params }: { params: { id: string } }) => {
  const doctorWithReviews = await getDoctorWithReviews(params.id);

  if (!doctorWithReviews) {
    notFound();
  }

  return (
    <div>
      <DoctorInfo doctorInfo={doctorWithReviews} />
    </div>
  );
};
export default DoctorDetails;
