import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';

export default function AppointmentsLoadingState() {
  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" /> {/* Appointments title */}
        <Skeleton className="h-5 w-96" /> {/* Subtitle */}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded" /> {/* Calendar icon */}
          <Skeleton className="h-6 w-32" /> {/* Appointments text */}
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-40" /> {/* Add Appointment button */}
          <Skeleton className="h-10 w-40 rounded-md" /> {/* Date picker */}
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Column>
              <Skeleton className="h-4 w-24" />
            </Table.Column>
            <Table.Column>
              <Skeleton className="h-4 w-32" />
            </Table.Column>
            <Table.Column>
              <Skeleton className="h-4 w-16" />
            </Table.Column>
            <Table.Column>
              <Skeleton className="h-4 w-40" />
            </Table.Column>
            <Table.Column>
              <Skeleton className="h-4 w-32" />
            </Table.Column>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...Array(5)].map((_, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <Skeleton className="h-4 w-64" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton className="h-4 w-40" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton className="h-4 w-32" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton className="h-4 w-32" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
