import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { PageContainer } from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils/cn';

interface SkeletonDashboardProps {
  isDark?: boolean;
}

export function SkeletonDashboard({ isDark = false }: SkeletonDashboardProps) {
  return (
    <PageContainer size="wide" className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Main Grid: Left Area (KPIs, Schedule, Line Graph) + Right Area (Upcoming Panel) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* 3 KPI Stat Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl border p-4.5 sm:p-5 transition-all flex flex-col justify-between shadow-xs min-h-28',
                  isDark
                    ? 'bg-[#181820] border-[#272733]'
                    : 'bg-white border-secondary-200'
                )}
              >
                <Skeleton className="h-8 w-28 mb-3" />
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-12 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Day Schedule Multi-Column Planner Skeleton */}
          <Card className={cn('p-5 rounded-2xl border space-y-4 min-h-95', isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200')}>
            <div className="flex items-center justify-between pb-3 border-b border-secondary-200 dark:border-[#272733]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>

            {/* 4 Columns Skeleton */}
            <div className="grid grid-cols-4 gap-3 pt-2 h-70">
              {[1, 2, 3, 4].map((col) => (
                <div key={col} className="space-y-3 p-2 rounded-xl border border-dashed border-secondary-200 dark:border-[#2a2a3a]">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  {col % 2 === 0 && <Skeleton className="h-16 w-full rounded-xl" />}
                </div>
              ))}
            </div>
          </Card>

          {/* Sales Spline Line Graph Skeleton */}
          <Card className={cn('p-5 rounded-2xl border space-y-4 min-h-72.5', isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-14 rounded-md" />
              </div>
            </div>
            <div className="h-48 pt-4 flex items-end gap-3 justify-between">
              {[40, 65, 30, 85, 55, 90, 70, 45, 80, 60, 95, 75].map((h, idx) => (
                <Skeleton
                  key={idx}
                  className="w-full rounded-t-md"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Upcoming Appointments Panel Skeleton */}
        <div className="xl:col-span-4">
          <Card className={cn('p-5 rounded-2xl border space-y-4 min-h-205', isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200')}>
            <div className="flex items-center justify-between pb-3 border-b border-secondary-200 dark:border-[#272733]">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>

            {/* Appointment Item Cards Skeleton */}
            <div className="space-y-3 pt-1">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className={cn(
                    'p-3.5 rounded-xl border flex items-center justify-between gap-3',
                    isDark ? 'border-[#272733] bg-[#14141d]' : 'border-secondary-200 bg-secondary-50/60'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
