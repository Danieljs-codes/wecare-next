'use client';

import { buttonStyles } from '@ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';

const RedirectButton = ({
  path,
  children,
  className,
}: {
  path: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Link
      className={buttonStyles({ size: 'small', className: className })}
      href={path}
    >
      {children}
    </Link>
  );
};

export { RedirectButton };
