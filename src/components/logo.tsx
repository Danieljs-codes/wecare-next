'use client';

import { useTheme } from 'next-themes';
import { Logo as LogoLight } from '@/assets/logo';
import { LogoDark } from '@/assets/logo-dark';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const { theme } = useTheme();

  if (theme === 'dark') {
    return <LogoDark className={className} />;
  }

  return <LogoLight className={className} />;
}
