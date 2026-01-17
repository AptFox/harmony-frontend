'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  HourOfDay,
  PlayerHourStatus,
  ScheduleSlot,
  TimeOff,
} from '@/types/ScheduleTypes';
import { useUser } from '@/contexts';
import React, { useEffect, useRef, useState } from 'react';
import {
  convertScheduleSlotToTargetDate,
  createDayOfWeekToDatesMap,
  createHoursInDayArray,
  daysOfWeek,
  getCurrentUserLocale,
  isTimeOffFn,
} from '@/lib/scheduleUtils';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/types/OrganizationTypes';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { CalendarX2 } from 'lucide-react';

export default function TeamScheduleTable({
  team,
}: {
  team: Team | undefined;
}) {
  const { user } = useUser();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock;
  const currentDate = new Date();
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

  const { teamSchedule, isLoading } = useTeamSchedule(team?.id);
  const playerSchedules = teamSchedule?.playerSchedules;

  useEffect(() => {
    if (playerSchedules && firstAvailableSlotCoordinate) {
      firstAvailableHourRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [firstAvailableSlotCoordinate, playerSchedules]);

  const hoursInDay: HourOfDay[] = createHoursInDayArray();

  const dayOfWeekToDatesMap = createDayOfWeekToDatesMap(currentDate);

  // TODO: move as much logic as possible to scheduleUtils.ts

  function createAvailabilityMap(): Map<
    HourOfDay,
    Map<string, PlayerHourStatus>
  > {
    const map = new Map<HourOfDay, Map<string, PlayerHourStatus>>();
    hoursInDay.forEach((hourOfDay) => {
      const availableDaysMap =
        map.get(hourOfDay) || new Map<string, PlayerHourStatus>();

      daysOfWeek.forEach((day) => {
        availableDaysMap.set(day, {
          isAvailable: false,
          isTimeOff: false,
          availablePlayers: new Set<string>(),
        });
      });
      map.set(hourOfDay, availableDaysMap);
    });
    return map;
  }

  function setHourStatusInMap(
    map: Map<HourOfDay, Map<string, PlayerHourStatus>>,
    currentPlayerName: string,
    timeOffs: TimeOff[],
    dayOfWeek: string,
    slot: ScheduleSlot
  ) {
    const targetDate = dayOfWeekToDatesMap.get(dayOfWeek);
    if (!targetDate) return;
    const { startTimeUtc, endTimeUtc } = convertScheduleSlotToTargetDate(
      slot,
      targetDate
    );
    const filterToHoursAvailableFn = (hourOfDay: HourOfDay) => {
      const hour = hourOfDay.hour;
      // TODO: consider putting hourOfDayOnTargetDate into the hourOfDay at creation
      const hourOfDayOnTargetDate = new Date(startTimeUtc);
      hourOfDayOnTargetDate.setHours(hour);
      return (
        hourOfDayOnTargetDate >= startTimeUtc &&
        hourOfDayOnTargetDate <= endTimeUtc
      );
    };
    const hoursAvailable = hoursInDay.filter((hourOfDay) =>
      filterToHoursAvailableFn(hourOfDay)
    );

    hoursAvailable.forEach((hourOfDay) => {
      const playerHourStatus = map.get(hourOfDay)?.get(dayOfWeek);
      if (!playerHourStatus) return;

      const isTimeOff = isTimeOffFn(
        timeOffs,
        dayOfWeekToDatesMap,
        dayOfWeek,
        hourOfDay
      );
      if (isTimeOff) return;
      playerHourStatus.isAvailable = !isTimeOff;
      playerHourStatus.availablePlayers.add(currentPlayerName);

      setFirstAvailableSlot(`${dayOfWeek}-${hourOfDay.absHourStr}`);
      map.get(hourOfDay)?.set(dayOfWeek, playerHourStatus);
    });
  }

  function setAvailabilityInMap(
    map: Map<HourOfDay, Map<string, PlayerHourStatus>>
  ) {
    if (playerSchedules !== undefined) {
      playerSchedules.forEach((playerSchedule) => {
        const playerName = playerSchedule.playerName;
        const weeklyAvailabilitySlotsForPlayer =
          playerSchedule.availability.weeklyAvailabilitySlots;
        const timeOffsForPlayer = playerSchedule.availability.timeOffs;
        daysOfWeek.forEach((day) => {
          const availabilitySlotsForDayOfWeek =
            weeklyAvailabilitySlotsForPlayer.filter(
              (slot) => slot.dayOfWeek === day
            );
          availabilitySlotsForDayOfWeek.forEach((slot) => {
            // We're operating on only slots that players are confirmed to be available
            setHourStatusInMap(map, playerName, timeOffsForPlayer, day, slot);
          });
        });
      });
    }
    return map;
  }

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  const formatPopoverDate = (date: Date | undefined): string => {
    const formatter = new Intl.DateTimeFormat(getCurrentUserLocale(), {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
    });

    return formatter.format(date);
  };

  const teamScheduleSlotPopOver = ({
    playerHourStatus,
    hourOfDayStr,
    day,
  }: {
    playerHourStatus: PlayerHourStatus;
    hourOfDayStr: string;
    day: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger className="flex w-full h-full justify-center items-center text-xs text-primary-foreground font-semibold font-mono">
          <span className="text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            {playerHourStatus.availablePlayers.size}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="bg-secondary border-foreground border-4 w-fit"
          align="center"
        >
          <PopoverArrow className="fill-foreground" />
          <div className="flex flex-col text-center text-sm">
            <p>
              {hourOfDayStr}, {formatPopoverDate(dayOfWeekToDatesMap.get(day))}
            </p>
            <div>Available:</div>
            <div className="grid gap-1 grid-cols-1">
              {Array.from(
                playerHourStatus.availablePlayers.entries().map(([player]) => (
                  <div key={player}>
                    <Badge>
                      <span className="text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] max-w-40 truncate">
                        {player}
                      </span>
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const noPlayersOnTeam = playerSchedules && playerSchedules?.length == 0;
  const scheduleSlots = playerSchedules?.flatMap(
    (schedule) => schedule.availability.weeklyAvailabilitySlots
  );
  const noSchedulesSubmittedForTeam =
    !noPlayersOnTeam && scheduleSlots?.length == 0;
  const renderSchedule = !noPlayersOnTeam && !noSchedulesSubmittedForTeam;
  const playerRoster = playerSchedules
    ?.map((sched) => sched.playerName)
    .join(', ');

  const emptyErrorMessage = () => {
    const title = noSchedulesSubmittedForTeam
      ? 'No schedules found'
      : 'No players found';
    const desc = noSchedulesSubmittedForTeam
      ? `No availability found for players: ${playerRoster}`
      : 'This usually means that there are no players on this team.';
    return (
      (noPlayersOnTeam || noSchedulesSubmittedForTeam) && (
        <Empty className="h-full w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{desc}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    );
  };

  return isLoading ? (
    <Skeleton />
  ) : (
    <div className="flex flex-auto max-h-96">
      {!renderSchedule && emptyErrorMessage()}
      {renderSchedule && playerSchedules && playerSchedules?.length > 0 && (
        <Table>
          <TableCaption className="font-mono">
            Roster: {playerRoster}
          </TableCaption>
          <TableHeader className="sticky top-0 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
              <TableHead className="px-0 h-6 text-center text-primary-foreground font-semibold font-mono">
                Hour
              </TableHead>
              {daysOfWeek.map((day) => (
                <TableHead
                  key={day}
                  className={`px-0 h-6 text-center text-primary-foreground font-semibold font-mono`}
                >
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {availabilityMap &&
              Array.from(
                availabilityMap
                  .entries()
                  .map(([hourOfDay, mapOfPlayerHourStatus]) => {
                    const hourOfDayStr = twelveHourClock
                      ? hourOfDay.twelveHourStr
                      : hourOfDay.absHourStr;
                    return (
                      <TableRow key={hourOfDay.absHourStr} className="border-0">
                        <TableCell className="text-xs text-center text-primary-foreground font-semibold font-mono border-b-1 bg-none">
                          {hourOfDayStr}
                        </TableCell>
                        {Array.from(
                          mapOfPlayerHourStatus
                            .entries()
                            .map(([day, playerHourStatus]) => {
                              const slotCoordinate = `${day}-${hourOfDay.absHourStr}`;
                              return (
                                <TableCell
                                  key={slotCoordinate}
                                  ref={
                                    slotCoordinate ===
                                    firstAvailableSlotCoordinate
                                      ? firstAvailableHourRef
                                      : undefined
                                  }
                                  className={`text-center p-0.5 ${playerHourStatus.isAvailable ? 'bg-primary lg:hover:brightness-85 transition-all' : 'border-b-1 bg-none'}`}
                                >
                                  {playerHourStatus.availablePlayers.size >
                                  0 ? (
                                    teamScheduleSlotPopOver({
                                      playerHourStatus,
                                      hourOfDayStr,
                                      day,
                                    })
                                  ) : (
                                    <span className="text-muted-foreground font-extralight">
                                      {playerHourStatus.availablePlayers.size}
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })
                        )}
                      </TableRow>
                    );
                  })
              )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
