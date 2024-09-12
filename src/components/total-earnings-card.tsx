'use client';

import { Button, buttonStyles } from '@ui/button';
import { Card } from '@ui/card';
import { IconDotsHorizontal, IconMoneybag } from 'justd-icons';
import { useTheme } from 'next-themes';

export const TotalEarningsCard = ({ earnings }: { earnings: number }) => {
  const { theme } = useTheme();

  return (
    <div>
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
                <IconMoneybag className="stroke-2" />
              </div>
              <span className="text-sm font-semibold text-muted-fg">
                Total Consultations
              </span>
            </div>
            <Button size="square-petite" appearance="plain">
              <IconDotsHorizontal />
            </Button>
          </div>
          <div className="flex items-center gap-x-2 mb-2">
            <h2 className="font-bold text-[2rem] text-fg tracking-[-0.96px]">
              ${(earnings / 100).toFixed(2)}
            </h2>
          </div>
          <div className="text-xs text-muted-fg font-medium mb-4">
            Gross earnings from completed consultations. Excludes fees, taxes,
            and deductions. May differ from final pay.
          </div>
          <div className="flex items-center gap-x-4">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{
                  width: `100%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
