'use client';

import { Button, buttonStyles } from '@ui/button';
import { SearchField } from '@ui/search-field';
import {
  IconCalendar2,
  IconUpload,
  IconChevronLeft,
  IconChevronRight,
} from 'justd-icons';
import { Table } from '@ui/table';
import { Card } from '@ui/card';
import { Link } from '@ui/link';
import { useRouter, usePathname } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { useMediaQuery } from '@ui/primitive';
import { EmptyState } from './empty-state';

interface Patient {
  patientId: string;
  patientName: string;
  patientLastName: string;
  bloodType: string;
  gender: string;
  birthDate: string;
  mobileNumber: string;
  email: string;
  relationshipCreatedAt: string;
}

interface DoctorPatientsProps {
  patients: Patient[];
  currentPage: number;
  totalPages: number;
  totalPatients: number;
}

export function DoctorPatients({
  patients,
  currentPage,
  totalPages,
  totalPatients,
}: DoctorPatientsProps) {
  const isMobile = useMediaQuery('(max-width: 500px)');
  const router = useRouter();
  const pathname = usePathname();

  function formatDate(date: string) {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, totalPatients);

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?page=${newPage}`, {
      scroll: false,
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl mb-2">List Patients</h1>
          <p className="text-xs text-muted-fg">
            This is the list of all the patients you have attended to
          </p>
        </div>
        <Button size="small" intent="primary" className="w-full md:w-auto mt-4">
          <IconUpload />
          Export Patients
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-x-2">
          <div
            className={buttonStyles({
              appearance: 'outline',
              size: 'square-petite',
            })}
          >
            <IconCalendar2 />
          </div>
          <p className="text-sm font-medium text-muted-fg">Appointments</p>
        </div>
        <SearchField
          placeholder="Search patients..."
          className="flex-grow sm:ml-4"
        />
      </div>
      <Card>
        <Table aria-label="Patients">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Gender</Table.Column>
            <Table.Column>Blood Type</Table.Column>
            <Table.Column>Date of Birth</Table.Column>
            <Table.Column>Contact</Table.Column>
            <Table.Column>Patient Since</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                title="You have no patients yet"
                description="You can start by adding a new patient or importing patient data."
                actionLabel="Add New Patient"
                onAction={() => router.push('/appointments')}
              />
            )}
            items={patients}
          >
            {patient => (
              <Table.Row id={patient.patientId}>
                <Table.Cell>{`${patient.patientName} ${patient.patientLastName}`}</Table.Cell>
                <Table.Cell className="capitalize">
                  {patient.gender || 'N/A'}
                </Table.Cell>
                <Table.Cell>{patient.bloodType || 'N/A'}</Table.Cell>
                <Table.Cell>{formatDate(patient.birthDate)}</Table.Cell>
                <Table.Cell>
                  <Link
                    intent="unstyled"
                    className="text-muted-fg"
                    href={`mailto:${patient.email}`}
                  >
                    {patient.email}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  {formatDate(patient.relationshipCreatedAt)}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card>
      <div className="mt-4 py-2">
        <div className="flex items-center space-x-2 justify-between">
          <Button
            size={isMobile ? 'extra-small' : 'small'}
            intent="secondary"
            onPress={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            <IconChevronLeft />
            Previous
          </Button>
          <p className="text-xs sm:text-sm text-muted-fg">
            {isMobile
              ? `${startIndex}-${endIndex} of ${totalPatients}`
              : `Showing ${startIndex} to ${endIndex} of ${totalPatients} results`}
          </p>
          <Button
            size={isMobile ? 'extra-small' : 'small'}
            intent="secondary"
            onPress={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
