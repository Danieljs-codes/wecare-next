'use client';

import { Button, buttonStyles } from '@ui/button';
import { IconCalendar2, IconPlus } from 'justd-icons';
import { useState } from 'react';
import { NewAppointmentModal } from './new-appointment-modal';
import { DatePicker } from '@ui/date-picker';
import { getLocalTimeZone, today, CalendarDate, parseDate } from '@internationalized/date';
import { Appointments } from '@lib/types';
import { Table } from '@ui/table';
import { Card } from '@ui/card';
import { EmptyState } from './empty-state';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, BadgeProps } from '@ui/badge';
import { DateTime } from 'luxon'; // Add this import

interface DoctorAppointmentsProps {
  appointments: Appointments;
}

export function DoctorAppointments({ appointments }: DoctorAppointmentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (value: CalendarDate) => {
    const formattedDate = DateTime.fromJSDate(
      value.toDate(getLocalTimeZone())
    ).toFormat('yyyy-MM-dd');
    router.push(`?date=${formattedDate}`);
  };

  function getStatusIntent(
    status: 'pending' | 'confirmed' | 'cancelled'
  ): BadgeProps['intent'] {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'primary';
    }
  }

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
          onChange={handleDateChange}
          defaultValue={parseDate(searchParams.get('date') ?? '') ?? today(getLocalTimeZone())}
        />
      </div>
      <div className="mt-6">
        <Card>
          <Table aria-label="Appointments">
            <Table.Header>
              <Table.Column>Patient Id</Table.Column>
              <Table.Column isRowHeader>Patient Name</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Appointment Date</Table.Column>
              <Table.Column>Time</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState
                  title="No appointments scheduled"
                  description="You can add a new appointment or wait for patient bookings."
                  actionLabel="Add New Appointment"
                  onAction={() => setIsOpen(true)}
                />
              )}
              items={appointments}
            >
              {appointment => (
                <Table.Row id={appointment.appointmentId}>
                  <Table.Cell>{appointment.patientId}</Table.Cell>
                  <Table.Cell>
                    {`${appointment.patientFirstName} ${appointment.patientLastName}`
                      .trim()
                      .replace(/\b\w/g, c => c.toUpperCase())}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge intent={getStatusIntent(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {DateTime.fromISO(appointment.appointmentStart).toFormat(
                      'LLL dd, yyyy'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {formatTimeRange(
                      appointment.appointmentStart,
                      appointment.appointmentEnd
                    )}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Card>
      </div>
      <NewAppointmentModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

function formatTimeRange(start: string, end: string): string {
  const startTime = DateTime.fromISO(start);
  const endTime = DateTime.fromISO(end);
  return `${startTime.toFormat('h:mm a')} - ${endTime.toFormat('h:mm a')}`;
}
