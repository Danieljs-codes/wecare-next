'use client';

import { Card } from '@ui/card';
import { Table } from '@ui/table';
import { EmptyState } from './empty-state';
import { useRouter } from 'next/navigation';

interface AppointmentData {
  appointmentId: string;
  appointmentStart: string;
  appointmentEnd: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientBloodType: string;
  patientGender: string;
}

interface AppointmentsTodayProps {
  appointments: AppointmentData[];
}

function formatTime(date: string) {
  return date ? new Date(date).toLocaleTimeString() : 'N/A';
}

export function AppointmentsToday({ appointments }: AppointmentsTodayProps) {
  const router = useRouter();

  return (
    <div className="pt-2">
      <Card.Header
        title="Appointments"
        description="A list of 5 appointments you have today. To see more, go to the appointments page."
        withoutPadding
      />
      <Card>
        <Table aria-label="Appointments Today">
          <Table.Header>
            <Table.Column>Appointment ID</Table.Column>
            <Table.Column>Start Time</Table.Column>
            <Table.Column>End Time</Table.Column>
            <Table.Column isRowHeader>Patient Name</Table.Column>
            <Table.Column>Patient Email</Table.Column>
            <Table.Column>Blood Type</Table.Column>
            <Table.Column>Gender</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                title="No appointments today"
                description="You have no appointments scheduled for today."
                actionLabel="Schedule Appointment"
                onAction={() => router.push('/appointments')}
              />
            )}
            items={appointments}
          >
            {(item: AppointmentData) => (
              <Table.Row>
                <Table.Cell>{item.appointmentId.substring(0, 5)}</Table.Cell>
                <Table.Cell>{formatTime(item.appointmentStart)}</Table.Cell>
                <Table.Cell>{formatTime(item.appointmentEnd)}</Table.Cell>
                <Table.Cell>{`${item.patientFirstName} ${item.patientLastName}`}</Table.Cell>
                <Table.Cell>{item.patientEmail}</Table.Cell>
                <Table.Cell>{item.patientBloodType || 'N/A'}</Table.Cell>
                <Table.Cell className="capitalize">
                  {item.patientGender || 'N/A'}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}

export default AppointmentsToday;
