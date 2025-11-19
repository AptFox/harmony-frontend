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
import { HourOfDay, HourStatus, TimeOff } from '@/types/ScheduleTypes';
import { useSchedule, useUser } from '@/contexts';
import { TimeOffIcon } from '@/components/ui/timeOffIcon';
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
} from '../ui/empty';

function createHoursInDayArray(): HourOfDay[] {
  return Array.from({ length: 24 }, (_, i): HourOfDay => {
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const absHourStr = `${hourString}h`;
    const ampm = i < 12 ? 'am' : 'pm';
    let twelveHour = i > 12 ? i % 12 : i;
    if (twelveHour === 0) twelveHour = 12;
    const twelveHourStr = `${twelveHour}${ampm}`;
    return { absHourStr, twelveHourStr, hour: i };
  });
}

const hoursInDay: HourOfDay[] = createHoursInDayArray();
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function createDayOfWeekToDatesMap(currentDate: Date): Map<string, Date> {
  const map = new Map<string, Date>();
  for (let i = 0; i < 7; i++) {
    const dateForDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + i,
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds()
    );
    const dayOfWeek = daysOfWeek[dateForDay.getDay()];
    map.set(dayOfWeek, dateForDay);
  }
  return map;
}

function isTimeOff(
  timeOffSlots: TimeOff[] | undefined,
  dayOfWeekToDatesMap: Map<string, Date>,
  day: string,
  hourOfDay: HourOfDay
): boolean {
  if (timeOffSlots === undefined) return false;
  timeOffSlots.forEach((timeOff) => {
    const startDate = new Date(timeOff.startTime);
    const endDate = new Date(timeOff.endTime);
    const dayDate = dayOfWeekToDatesMap.get(day);
    if (dayDate && dayDate >= startDate && dayDate <= endDate) {
      const startHour = startDate.getHours();
      const endHour = endDate.getHours();
      return hourOfDay.hour >= startHour && hourOfDay.hour <= endHour;
    }
  });
  return false;
}

export default function ScheduleTable() {
  const { user } = useUser();
  const {
    availability,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useSchedule();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock;
  const scheduleSlots = availability?.weeklyAvailabilitySlots ?? [];
  const timeOffSlots = availability?.availabilityExceptions;
  const scheduleTimeZone =
    scheduleSlots.length > 0 ? scheduleSlots[0].timeZoneId : undefined;
  const currentDate = new Date();
  const currentDay = daysOfWeek[currentDate.getDay()];
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
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [firstAvailableSlotCoordinate, scheduleSlots]);

  const dayOfWeekToDatesMap = createDayOfWeekToDatesMap(currentDate);

  function createAvailabilityMap(): Map<HourOfDay, Map<string, HourStatus>> {
    const map = new Map<HourOfDay, Map<string, HourStatus>>();
    hoursInDay.forEach((hourOfDay) => {
      const availableDaysMap =
        map.get(hourOfDay) || new Map<string, HourStatus>();
      daysOfWeek.forEach((day) => {
        availableDaysMap.set(day, { isAvailable: false, isTimeOff: false });
      });
      map.set(hourOfDay, availableDaysMap);
    });
    return map;
  }

  function setHourStatusInMap(
    map: Map<HourOfDay, Map<string, HourStatus>>,
    dayOfWeek: string,
    startHour: number,
    endHour: number
  ) {
    const filterFn = (hourOfDay: HourOfDay) => {
      const hour = hourOfDay.hour;
      return hour >= startHour && hour <= endHour;
    };
    hoursInDay
      .filter((hourOfDay) => filterFn(hourOfDay))
      .forEach((hourOfDay) => {
        const hourStatus = map.get(hourOfDay)?.get(dayOfWeek) || {
          isAvailable: false,
          isTimeOff: false,
        };
        hourStatus.isAvailable = true;
        hourStatus.isTimeOff = isTimeOff(
          timeOffSlots,
          dayOfWeekToDatesMap,
          dayOfWeek,
          hourOfDay
        );
        setFirstAvailableSlot(`${dayOfWeek}-${hourOfDay.absHourStr}`);
        map.get(hourOfDay)?.set(dayOfWeek, hourStatus);
      });
  }

  function setAvailabilityInMap(map: Map<HourOfDay, Map<string, HourStatus>>) {
    if (scheduleSlots !== undefined) {
      daysOfWeek.forEach((day) => {
        const slotsForDay = scheduleSlots.filter(
          (slot) => slot.dayOfWeek === day
        );
        slotsForDay.forEach((slot) => {
          const { startTime, endTime } = slot;
          const startHour = startTime.split(':').map(Number)[0];
          const endHour = endTime.split(':').map(Number)[0];
          const overnight = endHour < startHour;
          if (!overnight) {
            setHourStatusInMap(map, day, startHour, endHour);
          } else {
            // set hours until midnight
            setHourStatusInMap(map, day, startHour, 23);
            // set hours after midnight
            const indexOfNextDay = daysOfWeek.findIndex((it) => it === day) + 1;
            const index =
              indexOfNextDay > daysOfWeek.length - 1 ? 0 : indexOfNextDay;
            const dayToSet = daysOfWeek[index];
            setHourStatusInMap(map, dayToSet, 0, endHour);
          }
        });
      });
    }
    return map;
  }

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  const formatDate = (date: Date | undefined) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date);
  };

  const dialogContent = (setDialogOpen: Dispatch<SetStateAction<boolean>>) =>
    ScheduleTableDialog({ hoursInDay, setDialogOpen });

  return (
    <DashboardCard
      title="Schedule"
      buttonText="Update"
      dialogContent={dialogContent}
      parentClassName="flex-auto"
      childrenClassName="max-h-96 min-h-48"
    >
      {scheduleSlots.length > 0 && (
        <Table className="relative">
          {scheduleTimeZone && (
            <TableCaption>TZ: {scheduleTimeZone}</TableCaption>
          )}
          <TableHeader className="sticky top-0 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
              {daysOfWeek.map((day) => (
                <TableHead
                  key={day}
                  className={`px-0 h-6 text-center text-primary-foreground font-semibold font-mono`}
                >
                  <div
                    className={`flex-col ${currentDay === day ? 'border-y-3 border-primary' : ''}`}
                  >
                    <div>
                      <span className="text-xs text-muted-foreground font-extralight">
                        {formatDate(dayOfWeekToDatesMap.get(day))}
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
                availabilityMap.entries().map(([hourOfDay, dayOfWeekMap]) => (
                  <TableRow key={hourOfDay.absHourStr} className="border-0">
                    {Array.from(
                      dayOfWeekMap.entries().map(([day, hourStatus]) => {
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
                                className={`text-xs ${hourStatus.isAvailable ? 'text-primary-foreground font-semibold font-mono' : 'text-muted-foreground font-extralight line-through'}`}
                              >
                                {twelveHourClock
                                  ? hourOfDay.twelveHourStr
                                  : hourOfDay.absHourStr}
                              </span>
                            )}
                            {hourStatus.isTimeOff && (
                              <div className="flex w-full h-full justify-center items-center">
                                <TimeOffIcon className="w-4 h-4" />
                              </div>
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
      {scheduleSlots.length === 0 && (
        <Empty className="h-full w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 />
            </EmptyMedia>
            <EmptyTitle>No Schedule set</EmptyTitle>
            <EmptyDescription>You will appear as unavailable.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-background/30 to-background/0 z-10 pointer-events-none" />
    </DashboardCard>
  );
}
