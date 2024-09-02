'use client';

import { Badge } from '@ui/badge';
import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import {
  IconDotsHorizontal,
  IconSwitchHorizontal,
  IconTrendingChart4,
} from 'justd-icons';
import { useTheme } from 'next-themes';

interface TotalVisitorsCardProps {
  currentVisitors: number;
  previousVisitors: number;
  visitorsTodayCount: number;
  percentageChange: number;
  days: 7 | 14 | 30;
}

export function TotalVisitorsCard({
  currentVisitors,
  previousVisitors,
  visitorsTodayCount,
  percentageChange,
  days,
}: TotalVisitorsCardProps) {
  const { theme } = useTheme();

  return (
    <Card className="p-[1.125rem] flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-x-2">
            <div
              className={buttonStyles({
                size: 'square-petite',
                appearance: 'solid',
                intent: theme === 'dark' ? 'dark' : 'light',
              })}
            >
              <IconTrendingChart4 className="stroke-2" />
            </div>
            <span className="text-sm font-semibold text-muted-fg">
              Total Consultations
            </span>
          </div>
          <Button size="square-petite" appearance="plain">
            <IconDotsHorizontal />
          </Button>
        </div>
        <div className="flex items-center gap-x-2 mb-4">
          <h2 className="font-bold text-[2rem] text-fg tracking-[-0.96px]">
            {currentVisitors}
          </h2>
          <Badge
            className="text-xs tracking-[-0.24px]"
            intent={
              percentageChange > 0
                ? 'success'
                : percentageChange === 0
                ? 'warning'
                : 'danger'
            }
            shape="circle"
          >
            {percentageChange === 0
              ? '0%'
              : `${percentageChange > 0 ? '+' : '-'}${Math.abs(
                  percentageChange
                ).toFixed(1)}%`}
          </Badge>
        </div>
        <div className="text-xs text-muted-fg font-medium mb-4">
          Data obtained for the last {days} days from{' '}
          <span className="font-bold">{previousVisitors}</span> Visitors to{' '}
          <span className="font-bold">
            {currentVisitors + previousVisitors}
          </span>{' '}
          Visitors.
        </div>
        <div className="flex items-center gap-x-4">
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${(visitorsTodayCount / currentVisitors) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-fg whitespace-nowrap">
            {visitorsTodayCount} today
          </p>
        </div>
      </div>
    </Card>
  );
}
