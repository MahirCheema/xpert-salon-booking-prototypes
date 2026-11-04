import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'narrow' | 'default' | 'wide' | 'full';
}

const sizeClasses = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[1440px]',
  full: 'max-w-none',
};

export function PageContainer({
  children,
  size = 'wide',
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

