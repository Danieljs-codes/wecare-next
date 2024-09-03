import { DoctorAppointments } from '@components/doctor-appointments';

export const runtime = 'edge';

const Appointments = () => {
  return (
    <div>
      <DoctorAppointments />
    </div>
  );
};

export default Appointments;
