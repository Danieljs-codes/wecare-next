import { Card } from '@ui/card';
import { Grid } from '@ui/grid';
import { DashboardCard } from './DashboardCard';

export const runtime = 'edge';

interface DashboardItem {
  value: string;
  description: string;
}

function Dashboard() {
  const dashboardData: Record<string, DashboardItem> = {
    patients: { value: '1,234', description: 'Total Patients' },
    appointments: { value: '56', description: 'Upcoming Appointments' },
    revenue: { value: '$12,345', description: 'Monthly Revenue' },
    ratings: { value: '4.8', description: 'Average Rating' },
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      <h1 className="font-semibold text-2xl mb-2 lg:mb-4">Overview</h1>
      <Grid
        className="divide-y lg:divide-y-0 lg:divide-x lg:border-x"
        columns={{ initial: 1, lg: 4 }}
      >
        {Object.values(dashboardData).map((item, index) => (
          <DashboardCard key={index} {...item} />
        ))}
      </Grid>
      <div>
        <Card.Header
          className="px-0 pt-0"
          title="Products"
          description="A list of the latest products added to the store."
        />
      </div>
    </div>
  );
}

export default Dashboard;
