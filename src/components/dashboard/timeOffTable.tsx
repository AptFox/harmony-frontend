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
import { Maximize2, X } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Dispatch, SetStateAction, useState } from 'react';
import { TimeOffTableDialog } from '@/components/dashboard/timeOffTableDialog';

export default function TimeOffTable() {
  const { user } = useUser();
  const {
    availability,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useSchedule();
  const twelveHourClock = user?.twelveHourClock || true;
  const scheduledTimeOff: TimeOff[] | undefined =
    availability?.availabilityExceptions ?? [];
  const [deleteMode, setDeleteMode] = useState(false)
  const getDateCell = (startDateStr: string, endDateStr: string) => {
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

    let extraString: string | undefined = undefined;
    let topString: string | undefined = undefined;
    let bottomString: string | undefined = undefined;
    const multiDay = startDate.getDay() !== endDate.getDay();
    const [dayOfWeek, date, timeRange] = formatter
      .formatRange(startDate, endDate)
      .split(',');
    topString = `${dayOfWeek}, ${date}`;
    bottomString = timeRange;
    if (multiDay) {
      // "Mon, 10/27/25, 6:00 PM – Tue, 10/28/25, 12:30 AM"
      const [startStr, endStr] = formatter
        .formatRange(startDate, endDate)
        .split('–');
      const [startDayStr, startDateStr, startTimeStr] = startStr.split(',');
      const [endDayStr, endDateStr, endTimeStr] = endStr.split(',');
      extraString = `${startDayStr} - ${endDayStr}`;
      topString = `${startDateStr} - ${endDateStr}`;
      bottomString = `${startTimeStr} - ${endTimeStr}`;
    }

    return (
      <div>
        {multiDay && <Badge>multi-day</Badge>}
        {extraString && (
          <div>
            <span className={`text-xs text-primary-foreground font-mono`}>
              {extraString}
            </span>
          </div>
        )}
        {topString && (
          <div>
            <span className={`text-xs text-primary-foreground font-mono`}>
              {topString}
            </span>
          </div>
        )}
        {bottomString && (
          <div>
            <span className={`text-xs text-primary-foreground font-mono`}>
              {bottomString}
            </span>
          </div>
        )}
      </div>
    );
  };

  const trimComment = (comment: string) => {
    if (comment.length > 100) {
      return `${comment.slice(0, 100)}...`;
    }
    return comment;
  };

  // allows adding timeOff
  const dialogContent = (setDialogOpen: Dispatch<SetStateAction<boolean>>) =>
      TimeOffTableDialog({ setDialogOpen });


  // TODO: configure DashboardCard to have an edit button that triggers x's next to time slots, add onclick events that delete timeOff
  return (
    <DashboardCard
      title="Time off"
      buttonText="Add"
      dialogContent={dialogContent}
      parentClassName="flex-auto"
      childrenClassName="max-h-96 min-h-48"
    >
      {scheduledTimeOff.length > 0 && (
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
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
            {scheduledTimeOff.map((timeOff: TimeOff) => (
              <TableRow key={timeOff.id}>
                {/* <TableCell>
                    
                  </TableCell> */}
                <TableCell key={`${timeOff.id}-date-time`}>
                  {getDateCell(timeOff.startTime, timeOff.endTime)}
                </TableCell>
                <TableCell key={`${timeOff.id}-comment`}>
                  <div className="flex flex-row justify-between">
                    <span className="text-xs text-primary-foreground font-mono">
                      {trimComment(timeOff.comment)}
                    </span>
                    {timeOff.comment.length > 100 && (
                      <div>
                        <Dialog>
                          <DialogTrigger>
                            <Button size="icon" variant="outline">
                              <Maximize2 />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Selected time off comment</DialogTitle>
                              <DialogDescription>
                                {timeOff.comment}
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    { deleteMode && (
                      <div className="flex flex-row justify-center">
                        <Button size="icon" onClick={() => deleteTimeOff(timeOff)}>
                          <X className="bg-primary" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>Date format: MM/DD/YY</TableCaption>
        </Table>
      )}
      {scheduledTimeOff.length === 0 && (
        <Empty className="h-full w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TimeOffIcon />
            </EmptyMedia>
            <EmptyTitle>No time off scheduled</EmptyTitle>
          </EmptyHeader>
        </Empty>
      )}
    </DashboardCard>
  );
}
