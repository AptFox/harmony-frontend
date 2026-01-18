import { Skeleton } from '@/components/ui/skeleton';

const ScheduleTableRowSkeleton = () => {
  return (
    <Skeleton className="h-10 w-full border border-primary/65 rounded-md" />
  );
};

export default function ScheduleTableSkeleton() {
  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col h-90 w-105 justify-center items-center p-2 gap-1">
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
        <ScheduleTableRowSkeleton />
      </div>
    </div>
  );
}
