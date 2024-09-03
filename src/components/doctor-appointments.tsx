'use client';

import { Button } from '@ui/button';
import { IconPlus } from 'justd-icons';
import { useState } from 'react';
import { NewAppointmentModal } from './new-appointment-modal';

export const DoctorAppointments = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl mb-2">Appointments</h1>
          <p className="text-xs md:text-sm text-muted-fg">
            Manage your appointments and schedules with ease.
          </p>
        </div>
        <Button
          onPress={() => setIsOpen(true)}
          size="small"
          intent="primary"
          className="w-full md:w-auto mt-4"
        >
          <IconPlus />
          Add Appointment
        </Button>
      </div>
      <NewAppointmentModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};
