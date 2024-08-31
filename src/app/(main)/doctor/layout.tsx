import { ReactNode } from 'react';

const DoctorLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div>Hello</div>
      <div>{children}</div>
    </div>
  );
};
export default DoctorLayout;
