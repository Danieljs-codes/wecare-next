import { getPatientRegistrationDetails } from '@/app/(auth)/sign-up/action';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

const Dashboard = async () => {
  const user = await getPatientRegistrationDetails();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role === 'doctor') {
    redirect('/doctor/dashboard');
  } else {
    redirect('/patient/dashboard');
  }
};
export default Dashboard;
