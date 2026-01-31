'use client';

import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import DashboardCard from '@/components/dashboard/dashboardCard';
import { ScheduleTableDialog } from '@/components/dashboard/scheduleTableDialog';
import { HourOfDay } from '@/types/ScheduleTypes';
import { useSchedule, useUser } from '@/contexts';
import { CalendarX2 } from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  createHoursInDayArray,
  formatDateToCurrentLocale,
  getCurrentTimeZoneId,
  getDayCurrentDayOfWeekStr,
  getFormattedTimeZone,
  getAvailability,
  sortedDaysOfWeek,
  getDayOfWeekToDatesMap,
} from '@/lib/availabilityUtils';

const hoursInDay: HourOfDay[] = createHoursInDayArray();

export default function ScheduleTable() {
  const { user } = useUser();
  const { availability } = useSchedule();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock;
  const scheduleSlots = availability?.weeklyAvailabilitySlots;
  const timeOffSlots = availability?.timeOffs;
  const currentTimeZoneId = getCurrentTimeZoneId();
  const formattedTimeZone = getFormattedTimeZone(currentTimeZoneId);
  const scheduleSlotsNotInCurrentTimeZone =
    scheduleSlots?.filter((slot) => slot.timeZoneId !== currentTimeZoneId)
      .length || 0;
  const submittedScheduleMatchesCurrentTimeZone =
    scheduleSlotsNotInCurrentTimeZone === 0;
  const [firstAvailableSlotCoordinate, setFirstAvailableSlotCoordinate] =
    useState<string | undefined>(undefined);
  const firstAvailableHourRef = useRef<HTMLTableCellElement>(null);
  const hasFirstAvailableSlotBeenSetRef = useRef(false);
  const setFirstAvailableSlot = (coordinate: string) => {
    if (hasFirstAvailableSlotBeenSetRef.current) return;
    if (firstAvailableSlotCoordinate !== undefined) return;
    setFirstAvailableSlotCoordinate(coordinate);
    hasFirstAvailableSlotBeenSetRef.current = true;
  };

  useEffect(() => {
    if (scheduleSlots && firstAvailableSlotCoordinate) {
      firstAvailableHourRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [firstAvailableSlotCoordinate, scheduleSlots]);

  const dayOfWeekToDatesMap = getDayOfWeekToDatesMap(currentTimeZoneId);
  const availabilityMap = getAvailability(
    currentTimeZoneId,
    hoursInDay,
    scheduleSlots,
    timeOffSlots,
    submittedScheduleMatchesCurrentTimeZone,
    dayOfWeekToDatesMap,
    setFirstAvailableSlot
  );

  const dialogContent = (setDialogOpen: Dispatch<SetStateAction<boolean>>) =>
    ScheduleTableDialog({ hoursInDay, setDialogOpen });

  const renderScheduleTable =
    scheduleSlots &&
    scheduleSlots.length > 0 &&
    submittedScheduleMatchesCurrentTimeZone;
  const renderScheduleErrorMessage =
    (scheduleSlots && scheduleSlots.length === 0) ||
    !submittedScheduleMatchesCurrentTimeZone;
  const scheduleErrorTitle = submittedScheduleMatchesCurrentTimeZone
    ? 'No Schedule set'
    : `Submitted schedule does not match current time zone (${formattedTimeZone})`;
  const scheduleErrorDesc = submittedScheduleMatchesCurrentTimeZone
    ? 'You will appear as unavailable.'
    : 'Please update your schedule. Your availability will reflect the time zone where you submitted it.';

  return (
    <DashboardCard
      title={`My Schedule (${formattedTimeZone})`}
      buttonText="Update"
      dialogContent={dialogContent}
      parentClassName="flex-auto basis-xs"
      childrenClassName="max-h-96 min-h-48"
    >
      {renderScheduleTable && (
        <Table className="relative">
          {formattedTimeZone && (
            <TableCaption className="font-mono">
              TO = Time Off, TZ: {formattedTimeZone}
            </TableCaption>
          )}
          <TableHeader className="sticky top-0 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
              {sortedDaysOfWeek.map((day) => (
                <TableHead
                  key={day}
                  className={`px-0 h-6 text-center text-primary-foreground font-semibold font-mono`}
                >
                  <div
                    className={`flex-col ${getDayCurrentDayOfWeekStr() === day ? 'border-y-3 border-primary bg-primary/45' : ''}`}
                  >
                    <div>
                      <span className="text-xs text-muted-foreground font-extralight text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {formatDateToCurrentLocale(
                          dayOfWeekToDatesMap.get(day)
                        )}
                      </span>
                    </div>
                    <div>{day}</div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {availabilityMap &&
              Array.from(
                availabilityMap
                  .entries()
                  .map(([hourOfDay, mapOfHourStatus]) => (
                    <TableRow key={hourOfDay.absHourStr} className="border-0">
                      {Array.from(
                        mapOfHourStatus.entries().map(([day, hourStatus]) => {
                          const slotCoordinate = `${day}-${hourOfDay.absHourStr}`;
                          return (
                            <TableCell
                              key={slotCoordinate}
                              ref={
                                slotCoordinate === firstAvailableSlotCoordinate
                                  ? firstAvailableHourRef
                                  : undefined
                              }
                              className={`text-center p-0.5 ${hourStatus.isAvailable ? 'bg-primary' : 'border-b-1 bg-none'}`}
                            >
                              {!hourStatus.isTimeOff && (
                                <span
                                  className={`text-xs font-mono ${hourStatus.isAvailable ? 'text-primary-foreground font-semibold text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]' : 'text-muted-foreground font-extralight'}`}
                                >
                                  {twelveHourClock
                                    ? hourOfDay.twelveHourStr
                                    : hourOfDay.absHourStr}
                                </span>
                              )}
                              {hourStatus.isTimeOff && (
                                <span className="font-semibold font-mono">
                                  TO
                                </span>
                              )}
                            </TableCell>
                          );
                        })
                      )}
                    </TableRow>
                  ))
              )}
          </TableBody>
        </Table>
      )}
      {renderScheduleErrorMessage && (
        <Empty className="h-full w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 />
            </EmptyMedia>
            <EmptyTitle>{scheduleErrorTitle}</EmptyTitle>
            <EmptyDescription>{scheduleErrorDesc}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </DashboardCard>
  );
}
