'use client';

import { useTheme } from 'next-themes';
import { Logo as LogoLight } from '@/assets/logo';
import { LogoDark } from '@/assets/logo-dark';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark') {
    return <LogoDark className={className} />;
  }

  return <LogoLight className={className} />;
}
