import { redirect } from 'next/navigation';
import { StepIndicator } from './step-indicator';
import { getPatientRegistrationDetails } from '@/app/(auth)/sign-up/action';
import { Step1Form } from '@components/step-1-form';
import { Logo } from '@components/logo';
import { Step2DoctorForm } from './step-2-doctor-form';
import Step2PatientForm from './step-2-patient-form';
import { Link } from '@ui/link';

function SignUpForm({
  patientRegDetails,
  step,
}: {
  patientRegDetails: Awaited<ReturnType<typeof getPatientRegistrationDetails>>;
  step: number;
}) {
  if (step === 2 && !patientRegDetails) {
    redirect('/sign-up?step=1');
  }

  const initialFormData = patientRegDetails
    ? {
        firstName: patientRegDetails.firstName,
        lastName: patientRegDetails.lastName,
        email: patientRegDetails.email,
        password: patientRegDetails.password,
        role: patientRegDetails.role,
      }
    : undefined;

  return (
    <div className="flex items-center justify-center min-h-svh px-4">
      <div className="w-full max-w-[24rem]">
        <div className="flex items-center justify-center mb-4">
          <Logo />
        </div>
        <StepIndicator
          currentStep={step}
          steps={[
            { step: 1, title: 'Personal Info', path: '/sign-up?step=1' },
            { step: 2, title: 'Additional Info', path: '/sign-up/?step=2' },
          ]}
        />
        <div className="mt-6">
          {step === 1 && <Step1Form initialData={initialFormData} />}
          {step === 2 && patientRegDetails?.role === 'doctor' && (
            <Step2DoctorForm />
          )}
          {step === 2 && patientRegDetails?.role === 'patient' && (
            <Step2PatientForm />
          )}
        </div>
        <p className="mt-4 text-sm text-muted-fg text-center">
          Already have an account?{' '}
          <Link className="font-medium" intent="primary" href="/sign-in">
            Sign in to continue
          </Link>
        </p>
      </div>
    </div>
  );
}

export { SignUpForm };
