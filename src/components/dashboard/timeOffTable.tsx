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
import { Maximize2, X, Pencil, PencilOff } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { TimeOffTableDialog } from '@/components/dashboard/timeOffTableDialog';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getCurrentUserLocale } from '@/lib/availabilityUtils';
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';

export default function TimeOffTable() {
  const { user } = useUser();
  const { availability, deleteTimeOff, isLoading } = useSchedule();
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
    const formatter = new Intl.DateTimeFormat(getCurrentUserLocale(), {
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

  const timeOffCommentPopOver = (comment: string): JSX.Element => {
    return (
      <Popover>
        <PopoverTrigger asChild className="text-primary-foreground">
          <Button size="icon" variant="outline">
            <Maximize2 />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-secondary border-foreground border-4"
          align="center"
        >
          <PopoverArrow className="fill-foreground" />
          <p className="flex text-wrap max-w-md text-sm font-mono">{comment}</p>
        </PopoverContent>
      </Popover>
    );
  };

  const ExpandableComment = ({
    comment,
    deleteMode,
    timeOff,
  }: {
    comment: string | undefined;
    deleteMode: boolean;
    timeOff: TimeOff;
  }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = textRef.current;
      if (element) {
        // Check if the content is wider than the container
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    }, [comment]); // Re-run if the comment text changes

    return (
      <div className="flex items-center justify-between gap-2 h-10">
        <div ref={textRef} className="text-xs font-mono truncate min-w-0">
          <span
            className={`${comment ? 'text-primary-foreground font-semibold' : 'text-muted-foreground font-extralight'}`}
          >
            {comment || 'Empty Comment'}
          </span>
        </div>
        <div className="flex-shrink-0 p-2">
          {!deleteMode &&
            comment &&
            isOverflowing &&
            timeOffCommentPopOver(comment)}
          {deleteMode && (
            <Button size="icon" onClick={() => deleteTimeOff(timeOff)}>
              <X className="bg-primary" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardCard
      title="Time Off (TO)"
      buttonText="Add"
      dialogContent={dialogContent}
      secondElement={deleteModeButton}
      parentClassName="flex-auto basis-2xl"
      childrenClassName="max-h-96 min-h-48"
    >
      {isLoading && <ScheduleTableSkeleton />}
      {!isLoading && scheduledTimeOff && scheduledTimeOff.length > 0 && (
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
                    {getDateCell(timeOff.startTime, timeOff.endTime)}
                  </TableCell>
                  <TableCell
                    key={`${timeOff.id}-comment`}
                    className="max-w-[200px] truncate"
                  >
                    <ExpandableComment
                      comment={timeOff.comment}
                      deleteMode={deleteMode}
                      timeOff={timeOff}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableCaption className="font-mono">
            Date format: MM/DD/YY
          </TableCaption>
        </Table>
      )}
      {!scheduledTimeOff ||
        (scheduledTimeOff.length === 0 && (
          <Empty className="h-full w-full">
            <EmptyHeader>
              <EmptyTitle className="font-mono text-muted-foreground">
                No time off scheduled
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ))}
    </DashboardCard>
  );
}
