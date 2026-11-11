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
import { HourOfDay, PlayerHourStatus } from '@/types/ScheduleTypes';
import { useUser } from '@/contexts';
import React, { useEffect, useRef, useState } from 'react';
import {
  createEmptyAvailability,
  createHoursInDayArray,
  formatDateToCurrentLocale,
  getCurrentTimeZoneId,
  getCurrentUserLocale,
  getCurrentWeekStart,
  getDayCurrentDayOfWeekStr,
  getDayOfWeekToDatesMap,
  setHourStatusInMap,
  sortedDaysOfWeek,
} from '@/lib/availabilityUtils';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
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
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';
import { parseScheduleSlots } from '@/lib/availabilityService';
import { Temporal } from '@js-temporal/polyfill';

export default function TeamScheduleTable({
  team,
  selectedTimeZoneId,
  filteredPlayers,
}: {
  team: Team | undefined;
  selectedTimeZoneId: string;
  filteredPlayers: string[] | undefined;
}) {
  const { user } = useUser();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock;
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
  const mondayOfCurrentWeek = getCurrentWeekStart(selectedTimeZoneId);
  const { teamSchedule, isLoading } = useTeamSchedule(team?.id);
  const playerSchedules = teamSchedule?.playerSchedules;
  const [dayOfWeekToDatesMap, setDayOfWeekToDatesMap] = useState(
    getDayOfWeekToDatesMap(selectedTimeZoneId, mondayOfCurrentWeek)
  );
  useEffect(() => {
    if (selectedTimeZoneId !== getCurrentTimeZoneId()) {
      setDayOfWeekToDatesMap(
        getDayOfWeekToDatesMap(selectedTimeZoneId, mondayOfCurrentWeek)
      );
    }
    if (playerSchedules && firstAvailableSlotCoordinate) {
      firstAvailableHourRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstAvailableSlotCoordinate, playerSchedules, selectedTimeZoneId]);

  const hoursInDay: HourOfDay[] = createHoursInDayArray();

  function setAvailabilityInMap() {
    const map = createEmptyAvailability(hoursInDay);
    const recalculatedMap = getDayOfWeekToDatesMap(
      selectedTimeZoneId,
      mondayOfCurrentWeek
    );
    if (playerSchedules !== undefined) {
      playerSchedules
        .filter((schedule) => !filteredPlayers?.includes(schedule.playerName))
        .forEach((playerSchedule) => {
          const playerName = playerSchedule.playerName;
          const weeklyAvailabilitySlotsForPlayer =
            playerSchedule.availability.weeklyAvailabilitySlots;
          const timeOffsForPlayer = playerSchedule.availability.timeOffs;

          const parsedSlots = parseScheduleSlots(
            weeklyAvailabilitySlotsForPlayer,
            recalculatedMap,
            selectedTimeZoneId
          );
          sortedDaysOfWeek.forEach((dayOfWeek) => {
            const availabilitySlotsForDayOfWeek = parsedSlots.filter(
              (slot) => slot.dayOfWeek === dayOfWeek
            );
            availabilitySlotsForDayOfWeek.forEach((slot) => {
              // We're operating on only slots that players are confirmed to be available
              setHourStatusInMap(
                map,
                selectedTimeZoneId,
                dayOfWeek,
                recalculatedMap,
                slot,
                timeOffsForPlayer,
                hoursInDay,
                setFirstAvailableSlot,
                true,
                playerName
              );
            });
          });
        });
    }
    return map;
  }

  const availabilityMap = setAvailabilityInMap();
  const currentDayOfWeek = getDayCurrentDayOfWeekStr(selectedTimeZoneId);

  const visiblePlayerCount =
    playerSchedules?.filter(
      (schedule) => !filteredPlayers?.includes(schedule.playerName)
    ).length ?? 0;
  // Static class list so Tailwind can detect every shade at build time
  const availabilityShades = [
    'bg-primary/40',
    'bg-primary/50',
    'bg-primary/60',
    'bg-primary/70',
    'bg-primary/80',
  ];
  const getAvailabilityShade = (availablePlayerCount: number) => {
    if (visiblePlayerCount === 0) return availabilityShades[0];
    const ratio = availablePlayerCount / visiblePlayerCount;
    const index = Math.ceil(ratio * availabilityShades.length) - 1;
    return availabilityShades[
      Math.min(Math.max(index, 0), availabilityShades.length - 1)
    ];
  };

  const formatPopoverDate = (
    zdt: Temporal.ZonedDateTime | undefined
  ): string => {
    const dateToUse = zdt ? new Date(zdt.epochMilliseconds) : zdt;
    const formatter = new Intl.DateTimeFormat(getCurrentUserLocale(), {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
    });

    return formatter.format(dateToUse);
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
        <PopoverTrigger className="flex w-full h-full justify-center items-center text-sm text-white font-bold font-mono">
          <span className="text-shadow-[0_3px_3px_rgba(0,0,0,0.9)]">
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
              {Array.from(playerHourStatus.availablePlayers.entries()).map(
                ([player]) => (
                  <div key={player}>
                    <Badge>
                      <span className="text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] max-w-40 truncate">
                        {player}
                      </span>
                    </Badge>
                  </div>
                )
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
    <ScheduleTableSkeleton />
  ) : (
    <div className="@container flex flex-auto max-h-96">
      {!renderSchedule && emptyErrorMessage()}
      {renderSchedule && playerSchedules && playerSchedules?.length > 0 && (
        <Table>
          <TableCaption className="font-mono">
            Roster: {playerRoster}
          </TableCaption>
          <TableHeader className="sticky top-0 z-10 bg-secondary shadow-lg/30">
            <TableRow className="h-6">
              <TableHead className="px-0 h-6 text-center text-primary-foreground font-semibold font-mono">
                Hour
              </TableHead>
              {sortedDaysOfWeek.map((day) => (
                <TableHead
                  key={day}
                  className={`px-0 h-6 text-center text-primary-foreground font-semibold font-mono`}
                >
                  <div
                    className={`flex-col ${currentDayOfWeek === day ? 'border-y-3 border-primary bg-primary/45' : ''}`}
                  >
                    <div>
                      <span className="text-xs text-muted-foreground font-extralight text-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {/* Day number only on mobile so narrow columns don't crowd */}
                        <span className="@md:hidden">
                          {formatDateToCurrentLocale(
                            dayOfWeekToDatesMap.get(day),
                            undefined,
                            { day: 'numeric' }
                          )}
                        </span>
                        <span className="hidden @md:inline">
                          {formatDateToCurrentLocale(
                            dayOfWeekToDatesMap.get(day)
                          )}
                        </span>
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
                              const isToday = day === currentDayOfWeek;
                              return (
                                <TableCell
                                  key={slotCoordinate}
                                  ref={
                                    slotCoordinate ===
                                    firstAvailableSlotCoordinate
                                      ? firstAvailableHourRef
                                      : undefined
                                  }
                                  className={`text-center p-0.5 ${playerHourStatus.isAvailable ? `${getAvailabilityShade(playerHourStatus.availablePlayers.size)} lg:hover:ring-2 lg:hover:ring-inset lg:hover:ring-primary-foreground transition-all` : `border-b-1 ${isToday ? 'bg-primary/10' : 'bg-none'}`} ${isToday ? 'border-x border-primary' : ''}`}
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
