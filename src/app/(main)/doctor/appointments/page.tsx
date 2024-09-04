import { DoctorAppointments } from '@components/doctor-appointments';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

const Appointments = () => {
  return (
    <div>
      <DoctorAppointments />
    </div>
  );
};

export default Appointments;
