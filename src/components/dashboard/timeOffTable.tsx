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
import { Maximize2, X, Pencil, PencilOff } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TimeOffTableDialog } from '@/components/dashboard/timeOffTableDialog';

export default function TimeOffTable() {
  const { user } = useUser();
  const { availability, deleteTimeOff } = useSchedule();
  const twelveHourClock = user?.twelveHourClock || true;
  const scheduledTimeOff: TimeOff[] | undefined = availability?.timeOffs;
  const [deleteMode, setDeleteMode] = useState(false);
  useEffect(() => {
    if (scheduledTimeOff && scheduledTimeOff.length === 0) {
      setDeleteMode(false);
    }
  }, [scheduledTimeOff]);
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
      .split(',')
      .map((str) => str.trim());
    topString = `${dayOfWeek}, ${date}`;
    bottomString =
      timeRange.replace(/\s/g, '') === '12:00AM–11:59PM'
        ? 'All day'
        : timeRange;
    if (multiDay) {
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

  // allows adding timeOff
  const dialogContent = (setDialogOpen: Dispatch<SetStateAction<boolean>>) =>
    TimeOffTableDialog({ setDialogOpen });

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
  };

  const deleteModeButton = (): React.ReactNode => {
    const buttonText = deleteMode ? <PencilOff /> : <Pencil />;
    return (
      <Button size="icon" onClick={toggleDeleteMode}>
        {buttonText}
      </Button>
    );
  };

  const timeOffSortFn = (a: TimeOff, b: TimeOff): number => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  };

  return (
    <DashboardCard
      title="Time off"
      buttonText="Add"
      dialogContent={dialogContent}
      secondaryButton={deleteModeButton}
      parentClassName="flex-auto basis-2xl"
      childrenClassName="max-h-96 min-h-48"
    >
      {scheduledTimeOff && scheduledTimeOff.length > 0 && (
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
              <TableHead
                key="dateTime"
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
            {scheduledTimeOff
              .sort((a, b) => timeOffSortFn(a, b))
              .map((timeOff: TimeOff) => (
                <TableRow key={timeOff.id}>
                  <TableCell key={`${timeOff.id}-date-time`}>
                    <span className="">
                      {getDateCell(timeOff.startTime, timeOff.endTime)}
                    </span>
                  </TableCell>
                  <TableCell key={`${timeOff.id}-comment`}>
                    <div className="grid grid-rows-1">
                      <div className="flex flex-row justify-between overflow-hidden overflow-ellipsis">
                        <div className="text-xs text-primary-foreground font-mono truncate">
                          {timeOff.comment && timeOff.comment}
                          {!timeOff.comment && '...'}
                        </div>
                        {!deleteMode &&
                          timeOff.comment &&
                          timeOff.comment.length > 100 && (
                            <div className="p-2">
                              <Dialog>
                                <DialogTrigger>
                                  <Button size="icon" variant="outline">
                                    <Maximize2 />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Selected time off comment
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div>
                                    <span className="flex text-wrap min-w-0 max-w-md">
                                      {timeOff.comment}
                                    </span>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        {deleteMode && (
                          <div>
                            <Button
                              size="icon"
                              onClick={() => deleteTimeOff(timeOff)}
                            >
                              <X className="bg-primary" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableCaption>Date format: MM/DD/YY</TableCaption>
        </Table>
      )}
      {!scheduledTimeOff ||
        (scheduledTimeOff.length === 0 && (
          <Empty className="h-full w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TimeOffIcon />
              </EmptyMedia>
              <EmptyTitle>No time off scheduled</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ))}
    </DashboardCard>
  );
}
