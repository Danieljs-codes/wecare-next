import { SignUpForm } from '@components/sign-up-form';
import { getPatientRegistrationDetails } from './action';

export const runtime = 'edge';

// Add this line to disable caching for this route
export const dynamic = 'force-dynamic';

const SignUp = async ({
  searchParams,
}: {
  searchParams: { step?: string };
}) => {
  const step = searchParams.step ? parseInt(searchParams.step) : 1;
  const userDetails = await getPatientRegistrationDetails();

  return (
    <div>
      <SignUpForm key={step} patientRegDetails={userDetails} step={step} />
    </div>
  );
};

export default SignUp;
