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
} from 'justd-icons';
import { EmptyState } from './empty-state';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { Badge, BadgeProps } from '@ui/badge';
import { Menu } from '@ui/menu';

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

export const PatientAppointment = ({
  appointments,
}: {
  appointments: PatientAppointments;
}) => {
  const router = useRouter();
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
        <Button
          // onPress={() => setIsOpen(true)}
          size="small"
          intent="primary"
          className="w-full md:w-auto mt-4"
        >
          <IconPlus />
          Add Appointment
        </Button>
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
          <SearchField className="flex-1" />
          <Button className="size-10" size="square-petite">
            <IconSearch />
          </Button>
        </div>
        <Select
          className="sm:w-[250px] sm:ml-10"
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
            <Table.Column />
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState
                title="No appointments found"
                description="You have no appointments scheduled for today."
                actionLabel="Schedule Appointment"
                onAction={() => router.push('/doctor/appointments')}
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
                    {item.status.replace(/^\w/, c => c.toUpperCase())}``
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
                        <Menu.Item>Reschedule</Menu.Item>
                        <Menu.Separator />
                        <Menu.Item isDanger>Cancel Appointment</Menu.Item>
                      </Menu.Content>
                    </Menu>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};
