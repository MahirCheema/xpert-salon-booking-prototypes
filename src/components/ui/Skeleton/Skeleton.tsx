import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rounded',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-secondary-200/80 dark:bg-[#232332]',
        variant === 'circular' && 'rounded-full',
        variant === 'rounded' && 'rounded-xl',
        variant === 'rectangular' && 'rounded-none',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

