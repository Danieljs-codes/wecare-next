'use client';

import { PatientAppointments } from '@lib/types';
import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import { SearchField } from '@ui/search-field';
import { Select } from '@ui/select';
import { Table } from '@ui/table';
import {
  IconCalendar2,
  IconDotsVertical,
  IconPlus,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from 'justd-icons';
import { EmptyState } from './empty-state';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateTime } from 'luxon';
import { Badge, BadgeProps } from '@ui/badge';
import { Menu } from '@ui/menu';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useMediaQuery } from '@ui/primitive';
import { RescheduleAppointmentModal } from './reschedule-appointment-modal';
import { CancelAppointmentModal } from './cancel-appointment-modal';

interface Appointment {
  id: string;
  appointmentStart: string;
  appointmentEnd: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  doctorId: string;
}

const filterType = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'upcoming',
    name: 'Upcoming',
  },
  {
    id: 'past',
    name: 'Past',
  },
];

function getStatusIntent(
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
): BadgeProps['intent'] {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'completed':
      return 'primary';
    case 'no_show':
      return 'secondary';
    default:
      return 'primary';
  }
}

function getTimingIntent(date: string): BadgeProps['intent'] {
  const now = DateTime.now();
  const appointmentDate = DateTime.fromISO(date);

  if (appointmentDate < now) {
    return 'secondary'; // Past appointment
  } else {
    return 'primary'; // Future appointment
  }
}

export const PatientAppointment = ({
  appointments,
}: {
  appointments: PatientAppointments;
}) => {
  const { currentPage, totalAppointments, totalPages } = appointments;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(searchParams.get('name') ?? '');
  const isMobile = useMediaQuery('(max-width: 500px)');
  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, totalAppointments);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  let filter = searchParams.get('filter');

  if (
    !filter ||
    filter === '' ||
    (filter !== 'past' && filter !== 'upcoming')
  ) {
    filter = 'all';
  }

  const handlePageChange = (newPage: number) => {
    router.push(
      `/patient/appointments?${createQueryString('page', newPage.toString())}`,
      {
        scroll: false,
      }
    );
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl mb-2">Appointments</h1>
          <div className="text-xs md:text-sm text-muted-fg">
            <p>View and manage your past and upcoming appointments.</p>
            <p>
              Schedule new appointments or reschedule existing ones with ease.
            </p>
          </div>
        </div>
        <Link
          className={buttonStyles({
            size: 'small',
            className: 'w-full md:w-auto mt-4',
          })}
          href="/patient/search"
        >
          <IconPlus />
          Add Appointment
        </Link>
      </div>
      <div>
        <div className="flex items-center gap-x-2">
          <div
            className={buttonStyles({
              appearance: 'outline',
              size: 'square-petite',
            })}
          >
            <IconCalendar2 />
          </div>
          <p className="text-sm text-muted-fg font-medium">Appointments</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 my-4">
        <div className="flex items-center flex-grow gap-x-1 sm:gap-x-2">
          <SearchField
            placeholder="Search appointments by doctor's name"
            className="flex-1"
            value={name}
            onChange={setName}
            onClear={() =>
              router.push(
                '/patient/appointments' + '?' + createQueryString('name', '')
              )
            }
          />
          <Button
            onPress={() =>
              router.push(
                '/patient/appointments' +
                  '?' +
                  createQueryString('name', name.toLowerCase())
              )
            }
            className="size-10"
            size="square-petite"
          >
            <IconSearch />
          </Button>
        </div>
        <Select
          defaultSelectedKey={filter}
          onSelectionChange={filter =>
            router.push(
              '/patient/appointments' +
                '?' +
                createQueryString('filter', filter as string)
            )
          }
          className="sm:w-[180px] sm:ml-10"
          placeholder="Filter Appointment"
        >
          <Select.Trigger />
          <Select.List className="text-sm" items={filterType}>
            {item => (
              <Select.Option id={item.id} textValue={item.name}>
                {item.name}
              </Select.Option>
            )}
          </Select.List>
        </Select>
      </div>
      <Card>
        <Table>
          <Table.Header>
            <Table.Column isRowHeader>Appointment ID</Table.Column>
            <Table.Column>Start Time</Table.Column>
            <Table.Column>End Time</Table.Column>
            <Table.Column>Doctor Name</Table.Column>
            <Table.Column>Specialization</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Timing</Table.Column>
            <Table.Column />
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                title={
                  filter === 'past'
                    ? 'No past appointments found'
                    : filter === 'upcoming'
                    ? 'No upcoming appointments found'
                    : 'No appointments found'
                }
                description={
                  filter === 'past'
                    ? 'No past appointments found in your records.'
                    : filter === 'upcoming'
                    ? 'You have no upcoming appointments scheduled at this time.'
                    : 'Your appointment history is currently empty.'
                }
                actionLabel="Schedule Appointment"
                onAction={() => router.push('/patient/search')}
              />
            )}
            items={appointments.appointments}
          >
            {item => (
              <Table.Row id={item.id}>
                <Table.Cell>{item.id.substring(0, 5)}</Table.Cell>
                <Table.Cell>
                  {DateTime.fromISO(item.appointmentStart).toFormat(
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </Table.Cell>
                <Table.Cell>
                  {DateTime.fromISO(item.appointmentEnd).toFormat(
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </Table.Cell>
                <Table.Cell>
                  Dr. {item.doctorFirstName} {item.doctorLastName}
                </Table.Cell>
                <Table.Cell>{item.doctorSpecialization}</Table.Cell>
                <Table.Cell>
                  <Badge intent={getStatusIntent(item.status)}>
                    {item.status.replace(/^\w/, c => c.toUpperCase())}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge intent={getTimingIntent(item.appointmentStart)}>
                    {DateTime.fromISO(item.appointmentStart) > DateTime.now()
                      ? 'Upcoming'
                      : 'Past'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <Menu>
                      <Menu.Trigger>
                        <IconDotsVertical />
                      </Menu.Trigger>
                      <Menu.Content
                        className="min-w-48"
                        aria-label="Actions"
                        showArrow
                        placement="left"
                      >
                        <Menu.Item>View</Menu.Item>
                        <Menu.Item
                          isDisabled={
                            DateTime.fromISO(item.appointmentStart) <
                            DateTime.now()
                          }
                          onAction={() => handleReschedule(item)}
                        >
                          Reschedule
                        </Menu.Item>
                        <Menu.Separator />
                        <Menu.Item
                          isDisabled={
                            DateTime.fromISO(item.appointmentStart) <
                            DateTime.now()
                          }
                          isDanger={
                            DateTime.fromISO(item.appointmentStart) >
                            DateTime.now()
                          }
                          onAction={() => handleCancel(item)}
                        >
                          Cancel Appointment
                        </Menu.Item>
                      </Menu.Content>
                    </Menu>
                  </div>
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
              ? `${startIndex}-${endIndex} of ${totalAppointments}`
              : `Showing ${startIndex} to ${endIndex} of ${totalAppointments} results`}
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

      {selectedAppointment && (
        <RescheduleAppointmentModal
          isOpen={isRescheduleModalOpen}
          onOpenChange={setIsRescheduleModalOpen}
          appointmentId={selectedAppointment.id}
          doctorId={selectedAppointment.doctorId}
          currentAppointmentStart={selectedAppointment.appointmentStart}
        />
      )}

      {selectedAppointment && (
        <CancelAppointmentModal
          isOpen={isCancelModalOpen}
          onOpenChange={setIsCancelModalOpen}
          appointmentId={selectedAppointment.id}
        />
      )}
    </div>
  );
};
