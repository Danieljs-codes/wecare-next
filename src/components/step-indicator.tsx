'use client';

import { buttonStyles } from '@ui/button';
import { cn } from '@ui/primitive';
import { IconCheck, IconChevronRight } from 'justd-icons';
import Link from 'next/link';
import { Fragment } from 'react/jsx-runtime';

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    step: number;
    title: string;
    path: string;
  }>;
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-x-3">
      {steps.map((step, index) => (
        <Fragment key={step.title}>
          <div>
            {step.step < currentStep ? (
              <div className="flex items-center gap-x-2">
                <div
                  className={buttonStyles({
                    size: 'square-petite',
                    shape: 'circle',
                    intent: 'success',
                    className: 'size-6',
                  })}
                >
                  <IconCheck className="size-3 " />
                </div>

                <Link href={step.path} className="text-sm text-muted-fg">
                  {step.title}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-x-2">
                <div
                  className={buttonStyles({
                    size: 'square-petite',
                    shape: 'circle',
                    intent: 'secondary',
                    className: 'size-6',
                  })}
                >
                  <span className="text-xs">{step.step}</span>
                </div>
                {step.step === currentStep ? (
                  <span className="text-sm font-medium text-fg">
                    {step.title}
                  </span>
                ) : (
                  <Link
                    href={step.path}
                    className={cn(
                      'text-sm text-muted-fg',
                      step.step === currentStep && 'font-medium text-fg'
                    )}
                  >
                    {step.title}
                  </Link>
                )}
              </div>
            )}
          </div>
          {index < steps.length - 1 && (
            <IconChevronRight className="text-muted-fg" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
