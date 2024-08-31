import { Card } from '@ui/card'

interface DashboardCardProps {
  value: string
  description: string
}

export function DashboardCard({ value, description }: DashboardCardProps) {
  return (
    <Card className="border-y-0 shadow-none border-x-0 rounded-none py-4 lg:px-6">
      <Card.Header
        className="p-0"
        title={value}
        
        description={description}
      />
    </Card>
  )
}