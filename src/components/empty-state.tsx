'use client';

import React from 'react';
import { Button } from '@ui/button';
import icon from '@/assets/icons/file-type-icon.svg?url';
import backgroundSvg from '@/assets/background-circles.svg?url';
import { useTheme } from 'next-themes';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onClear?: () => void;
}

console.log(icon);

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  onClear,
}) => {
  const { theme } = useTheme();
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-bg rounded-lg">
      {/* SVG Background */}
      {theme === 'light' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={backgroundSvg.src} alt="" className="w-full h-full" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 rounded-full opacity-20" />
          <div
            className="size-20 bg-border flex items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(180deg, #F9FAFB 0%, #EDF0F3 100%))',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon.src} alt="Empty folder" className="relative z-10" />
          </div>
        </div>
        <h2 className="text-base font-semibold text-fg mb-1">{title}</h2>
        <p className="text-muted-fg text-sm mb-6 max-w-[350px]">
          {description}
        </p>
        <div className="flex justify-center space-x-2">
          {onClear && (
            <Button onPress={onClear} size="small" intent="secondary">
              Clear search
            </Button>
          )}
          <Button size="small" onPress={onAction}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { EmptyState };
