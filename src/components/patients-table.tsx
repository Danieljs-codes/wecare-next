'use client';

import { Card } from '@ui/card';
import { Table } from '@ui/table';
import { EmptyState } from './empty-state';
import { useRouter } from 'next/navigation';
import { Link } from 'next-view-transitions';

interface PatientData {
  patientId: string;
  patientName: string;
  patientLastName: string;
  bloodType: string;
  gender: string;
  genoType: string;
  birthDate: string;
  occupation: string;
  mobileNumber: string;
  address: string;
  email: string;
  relationshipCreatedAt: string;
}

interface PatientsTableProps {
  patients: PatientData[];
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const router = useRouter();

  function formatDOB(date: string) {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }

  return (
    <div className="pt-2">
      <Card.Header
        title="Patients"
        // @ts-expect-error - It expects a string but the underlying element used the `Description` from RAC accepts JSX
        description={
          <p>
            A list of 5 patients you have attended to. To see more, go to the{' '}
            <Link className="underline" href="/doctor/patients">
              patients page.
            </Link>
          </p>
        }
        withoutPadding
      />
      <Card>
        <Table aria-label="Patients">
          <Table.Header>
            <Table.Column>ID Code</Table.Column>
            <Table.Column isRowHeader>Full Name</Table.Column>
            <Table.Column>Email</Table.Column>
            <Table.Column>Blood Type</Table.Column>
            <Table.Column>Gender</Table.Column>
            <Table.Column>Geno Type</Table.Column>
            <Table.Column>Birth Date</Table.Column>
            <Table.Column>Occupation</Table.Column>
            <Table.Column>Mobile Number</Table.Column>
            <Table.Column>Address</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                title="You have no patients yet"
                description="You can start by adding a new appointment with a patient or accepting a booking from a patient."
                actionLabel="Add New Appointment"
                onAction={() => router.push('/appointments')}
              />
            )}
            items={patients}
          >
            {item => (
              <Table.Row id={item.patientId}>
                <Table.Cell>{item.patientId.substring(0, 5)}</Table.Cell>
                <Table.Cell>{`${item.patientName} ${item.patientLastName}`}</Table.Cell>
                <Table.Cell>{item.email}</Table.Cell>
                <Table.Cell>{item.bloodType || 'N/A'}</Table.Cell>
                <Table.Cell className="capitalize">
                  {item.gender || 'N/A'}
                </Table.Cell>
                <Table.Cell>{item.genoType || 'N/A'}</Table.Cell>
                <Table.Cell>{formatDOB(item.birthDate)}</Table.Cell>
                <Table.Cell>{item.occupation || 'N/A'}</Table.Cell>
                <Table.Cell>
                  {item.mobileNumber ? item.mobileNumber.split(' x')[0] : 'N/A'}
                </Table.Cell>
                <Table.Cell>{item.address || 'N/A'}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}
