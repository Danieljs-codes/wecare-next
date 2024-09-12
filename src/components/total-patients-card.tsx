'use client';

import { Badge } from '@ui/badge';
import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import {
  IconDotsHorizontal,
  IconPersonAdd
} from 'justd-icons';
import { useTheme } from 'next-themes';

interface TotalPatientCardProps {
  totalPatients: number;
  newPatients: number;
  percentageIncrease: number;
  days: 7 | 14 | 30;
}

export function TotalPatientCard({
  totalPatients,
  newPatients,
  percentageIncrease,
  days,
}: TotalPatientCardProps) {
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
              <IconPersonAdd className="stroke-2" />
            </div>
            <span className="text-sm font-semibold text-muted-fg">
              Total patient
            </span>
          </div>
          <Button size="square-petite" appearance="plain">
            <IconDotsHorizontal />
          </Button>
        </div>
        <div className="flex items-center gap-x-2 mb-[1.875rem]">
          <h2 className="font-bold text-[2rem] text-fg tracking-[-0.96px]">
            {totalPatients}
          </h2>
          <Badge
            className="text-xs tracking-[-0.24px]"
            intent={
              percentageIncrease > 0
                ? 'success'
                : percentageIncrease === 0
                ? 'warning'
                : 'danger'
            }
            shape="circle"
          >
            {percentageIncrease === 0
              ? '0%'
              : `${percentageIncrease > 0 ? '+' : '-'}${Math.abs(
                  percentageIncrease
                ).toFixed(1)}%`}
          </Badge>
        </div>
        <div className="flex items-center gap-x-5">
          <div>
            <svg
              width="110"
              height="55"
              viewBox="0 0 110 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="30" width="8" height="25" rx="4" fill="#B2F2D8" />
              <rect x="17" y="20" width="8" height="35" rx="4" fill="#B2F2D8" />
              <rect x="34" width="8" height="55" rx="4" fill="#82D8BE" />
              <rect x="51" y="20" width="8" height="35" rx="4" fill="#82D8BE" />
              <rect x="68" y="5" width="8" height="50" rx="4" fill="#59B29F" />
              <rect x="85" y="20" width="8" height="35" rx="4" fill="#59B29F" />
              <rect x="102" y="5" width="8" height="50" rx="4" fill="#59B29F" />
            </svg>
          </div>
          <div className="text-xs text-muted-fg font-medium">
            Increase in data by <span className="font-bold">{newPatients}</span>{' '}
            patients in the last {days} days
          </div>
        </div>
      </div>
    </Card>
  );
}
