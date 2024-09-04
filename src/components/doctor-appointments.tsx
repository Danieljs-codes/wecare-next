'use client';

import { Button, buttonStyles } from '@ui/button';
import { IconCalendar2, IconPlus } from 'justd-icons';
import { useState } from 'react';
import { NewAppointmentModal } from './new-appointment-modal';
import { DatePicker } from '@ui/date-picker';
import { getLocalTimeZone, today } from '@internationalized/date';

export const DoctorAppointments = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<{
    day: number;
    month: number;
    year: number;
  } | null>();

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div
            className={buttonStyles({
              appearance: 'outline',
              size: 'square-petite',
            })}
          >
            <IconCalendar2 />
          </div>
          <p className="text-sm text-muted-fg">Appointments</p>
        </div>
        <DatePicker
          aria-label="Appointment Date"
          onChange={value => {
            setDate({
              day: value.day,
              month: value.month,
              year: value.year,
            });
            console.log(value);
          }}
          defaultValue={today(getLocalTimeZone())}
        />
      </div>
      <NewAppointmentModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};
