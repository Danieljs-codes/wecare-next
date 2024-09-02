'use client';

import { useTheme } from 'next-themes';
import LogoLight from '@/assets/logo.svg';
import LogoDark from '@/assets/logo-dark.svg';

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
