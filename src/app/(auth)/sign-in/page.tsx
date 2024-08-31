import { SignInForm } from '@components/sign-in-form';

export const runtime = 'edge';

function SignIn() {
  return (
    <div>
      <SignInForm />
    </div>
  );
}

export default SignIn;
