import {
  Table,
  TableHeader,
  TableCaption,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import DashboardCard from '@/components/dashboard/dashboardCard';
import { TimeOff } from '@/types/ScheduleTypes';
import { useSchedule, useUser } from '@/contexts';
import { TimeOffIcon } from '@/components/ui/timeOffIcon';

export default function TimeOffTable() {
  const {
    user
  } = useUser();
  const {
    availability,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useSchedule();
  const twelveHourClock =  user?.twelveHourClock || true;
  const scheduledTimeOff: TimeOff[] | undefined =
    availability?.availabilityExceptions;
  const formatDate = (startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: twelveHourClock,
      weekday: 'short',
    });

    const [dayOfWeek, date, timeRange] = formatter
      .formatRange(startDate, endDate)
      .split(',');
    return (
      <div>
        <div>
          <span
            className={`text-xs text-primary-foreground font-mono`}
          >{`${dayOfWeek}, ${date}`}</span>
        </div>
        <div>
          <span className={`text-xs text-primary-foreground font-mono`}>
            {timeRange}
          </span>
        </div>
      </div>
    );
  };

  const formatComment = (comment: string) => {
    if (comment.length > 100) {
      return `${comment.slice(0, 100)}...`;
    }
    return comment;
  };

  return (
    <DashboardCard
      title="Time off"
      buttonText="Add"
      parentClassName="flex-auto h-fit"
      childrenClassName="min-h-fit max-h-80"
    >
      <Table className="relative">
        <TableHeader className="sticky top-0 bg-secondary">
          <TableRow className="h-6">
            <TableHead key="icon" className="h-6 text-primary-foreground">
              <div className="flex w-full h-full justify-center items-center">
                <TimeOffIcon className="w-4 h-4" />
              </div>
            </TableHead>
            <TableHead
              key="startTime"
              className={`h-6 text-primary-foreground font-semibold font-mono`}
            >
              <span>Date/Time</span>
            </TableHead>
            <TableHead
              key="comment"
              className={`h-6 text-primary-foreground font-semibold font-mono`}
            >
              <span>Comment</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledTimeOff &&
            scheduledTimeOff.map((timeOff: TimeOff) => (
              <TableRow key={timeOff.id}>
                <TableCell key={`${timeOff.id}-icon`}>
                  <div className="flex w-full h-full justify-center items-center">
                    <TimeOffIcon className="w-4 h-4" />
                  </div>
                </TableCell>
                <TableCell key={`${timeOff.id}-date-time`}>
                  {formatDate(timeOff.startTime, timeOff.endTime)}
                </TableCell>
                <TableCell key={`${timeOff.id}-comment`}>
                  <span className={`text-xs text-primary-foreground font-mono`}>
                    {formatComment(timeOff.comment)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        {!scheduledTimeOff && (
          <TableCaption>No time off scheduled</TableCaption>
        )}
      </Table>
    </DashboardCard>
  );
}
