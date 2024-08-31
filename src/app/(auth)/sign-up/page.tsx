import { SignUpForm } from '@components/sign-up-form';
import { getPatientRegistrationDetails } from './action';

export const runtime = 'edge';

const SignUp = async ({ searchParams }: { searchParams: { step?: string } }) => {
  const step = searchParams.step ? parseInt(searchParams.step) : 1;
  const userDetails = await getPatientRegistrationDetails();

  return (
    <div>
      <SignUpForm patientRegDetails={userDetails} step={step} />
    </div>
  );
};

export default SignUp;
