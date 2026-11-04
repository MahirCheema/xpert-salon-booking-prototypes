import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { PageContainer } from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils/cn';

interface SkeletonAppointmentsProps {
  isDark?: boolean;
}

export function SkeletonAppointments({ isDark = false }: SkeletonAppointmentsProps) {
  return (
    <PageContainer size="wide" className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      {/* Filter & Search Toolbar Skeleton */}
      <Card className={cn('p-4 rounded-2xl border', isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200')}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </Card>

      {/* Appointment Cards Skeleton List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className={cn(
              'p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200'
            )}
          >
            {/* Left: Time & Customer Info */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <Skeleton className="h-12 w-16 rounded-xl shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>

            {/* Right: Specialist, Price & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-3.5 pt-2 md:pt-0 border-t md:border-t-0 border-secondary-100 dark:border-[#252535]">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

