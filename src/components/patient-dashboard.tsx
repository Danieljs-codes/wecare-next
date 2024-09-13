'use client';

import { Card } from '@ui/card';
import { Grid } from '@ui/grid';
import hand from '@/assets/hand.png';
import { Table } from '@ui/table';
import { EmptyState } from './empty-state';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';

interface UpcomingAppointment {
  appointmentId: string;
  appointmentStart: string;
  appointmentEnd: string;
  doctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialty: string;
}

export const PatientDashboard = ({
  totalSpending,
  name,
  totalAppointments,
  upcomingAppointments,
  totalUpcomingAppointments,
  cancelledAppointments,
}: {
  totalSpending: number;
  name: string;
  totalAppointments: number;
  totalUpcomingAppointments: number;
  upcomingAppointments: UpcomingAppointment[];
  cancelledAppointments: number;
}) => {
  const router = useRouter();

  console.log(totalAppointments);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-semibold text-fg text-xl capitalize">
          {`Welcome back, ${name}`}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hand.src}
            alt="hand"
            className="inline-block mb-1 size-[20px] ml-1"
            aria-hidden="true"
          />
        </h1>
        <p className="mt-2 text-muted-fg text-xs md:text-sm">
          Here is the latest update for your career. Check now
        </p>
      </div>
      <Grid
        className="divide-y lg:divide-y-0 lg:divide-x lg:border-x"
        columns={{ initial: 1, lg: 4 }}
      >
        <Card className="border-y-0 shadow-none border-x-0 rounded-none py-4 lg:px-6">
          <Card.Header
            className="p-0"
            title={`$${(totalSpending / 100).toFixed(2)}`}
            description={
              "This is the total amount you've spent on your appointments"
            }
          />
        </Card>
        <Card className="border-y-0 shadow-none border-x-0 rounded-none py-4 lg:px-6">
          <Card.Header
            className="p-0"
            title={`${totalAppointments}`}
            description={"This is the total number of appointments you've had"}
          />
        </Card>
        <Card className="border-y-0 shadow-none border-x-0 rounded-none py-4 lg:px-6">
          <Card.Header
            className="p-0"
            title={`${totalUpcomingAppointments}`}
            description={
              'This is the number of upcoming appointments you have scheduled'
            }
          />
        </Card>
        <Card className="border-y-0 shadow-none border-x-0 rounded-none py-4 lg:px-6">
          <Card.Header
            className="p-0"
            title={`${cancelledAppointments}`}
            description={
              'This is the number of appointments you have cancelled'
            }
          />
        </Card>
      </Grid>
      <div className="mt-6">
        <Card.Header
          className="px-0 pt-0"
          title="Appointments"
          description="A list of your upcoming appointments (showing up to 5)"
        />
        <Card>
          <Table aria-label="Appointments">
            <Table.Header>
              <Table.Column>#</Table.Column>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Start Time</Table.Column>
              <Table.Column>End Time</Table.Column>
              <Table.Column>Specialty</Table.Column>
            </Table.Header>
            <Table.Body
              items={upcomingAppointments}
              renderEmptyState={() => (
                <EmptyState
                  title="You have no upcoming appointment"
                  description="You can start by booking an appointment with a doctor."
                  actionLabel="Add New Appointment"
                  onAction={() => router.push('/patient/appointments')}
                />
              )}
            >
              {item => (
                <Table.Row id={item.appointmentId}>
                  <Table.Cell>{item.appointmentId.substring(0, 5)}</Table.Cell>
                  <Table.Cell className="capitalize">
                    {`Dr. ${item.doctorFirstName} ${item.doctorLastName}`}
                  </Table.Cell>
                  <Table.Cell>
                    {DateTime.fromISO(item.appointmentStart).toFormat(
                      'LLL d yyyy, h:mma'
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {DateTime.fromISO(item.appointmentEnd).toFormat(
                      'LLL d yyyy, h:mma'
                    )}
                  </Table.Cell>
                  <Table.Cell>{item.doctorSpecialty}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Card>
      </div>
    </div>
  );
};
