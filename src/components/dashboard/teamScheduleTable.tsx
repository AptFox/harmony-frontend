'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import DashboardCard from '@/components/dashboard/dashboardCard';
import {
  HourOfDay,
  PlayerHourStatus,
  ScheduleSlot,
  TimeOff,
} from '@/types/ScheduleTypes';
import { usePlayer, useUser } from '@/contexts';
import React, { useEffect, useRef, useState } from 'react';
import {
  convertScheduleSlotToTargetDate,
  createDayOfWeekToDatesMap,
  createHoursInDayArray,
  daysOfWeek,
  isTimeOffFn,
} from '@/lib/scheduleUtils';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';

export default function TeamScheduleTable() {
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
  const { teams } = usePlayer();
  const firstTeam = teams.length > 0 ? teams[0] : undefined;
  const [selectedTeamId, setSelectedTeamId] = useState(
    firstTeam ? firstTeam.id : null
  );

  const {
    teamSchedule: selectedTeamSchedule,
    isLoading: isLoadingTeamSchedule,
  } = useTeamSchedule(selectedTeamId);
  const playerSchedules = selectedTeamSchedule?.playerSchedules;
  const playersWithNoAvailability = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length === 0
    )
    .map((player) => player.playerName);

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
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      weekday: 'short',
    });

    return formatter.format(date);
  };

  const playersWithNoAvailabilityPopOver = () => {
    return (
      playersWithNoAvailability &&
      playersWithNoAvailability.length > 0 && (
        <div className="p-1">
          <Popover>
            <PopoverTrigger asChild className="text-primary-foreground">
              <Button size="sm">
                <span>Empty schedules: </span>
                <span>{playersWithNoAvailability.length}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-60 bg-secondary border-foreground border-4"
              align="center"
            >
              <PopoverArrow className="fill-foreground" />
              <p>
                <span className="text-sm text-muted-foreground">
                  No schedule set for:{' '}
                </span>
                <span className="text-sm">
                  {playersWithNoAvailability.join(', ')}
                </span>
              </p>
            </PopoverContent>
          </Popover>
        </div>
      )
    );
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
          {playerHourStatus.availablePlayers.size}
        </PopoverTrigger>
        <PopoverContent
          className="w-40 bg-secondary border-foreground border-4"
          align="center"
        >
          <PopoverArrow className="fill-foreground" />
          <div className="grid gap-1 text-center text-sm">
            <p>
              {hourOfDayStr}, {formatPopoverDate(dayOfWeekToDatesMap.get(day))}
            </p>
            <p>
              Available:{' '}
              {Array.from(
                playerHourStatus.availablePlayers
                  .entries()
                  .map(([player]) => (
                    <Badge key={player}>{player.toString()}</Badge>
                  ))
              )}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <DashboardCard
      title={`${firstTeam?.name} - Team Schedule`}
      parentClassName="flex-auto max-w-135"
      childrenClassName="max-h-96 min-h-48"
    >
      {teams && (
        <Tabs
          className="flex-auto w-full"
          value={selectedTeamId || undefined}
          onValueChange={setSelectedTeamId}
        >
          <div className="flex flex-row justify-between">
            <TabsList className={teams.length > 1 ? `border` : ''}>
              {teams.map((team) => (
                <TabsTrigger key={team.organization.id} value={team.id}>
                  {team.organization.acronym}
                </TabsTrigger>
              ))}
            </TabsList>
            {playersWithNoAvailabilityPopOver()}
          </div>
          <TabsContent
            className="relative overflow-auto mt-0.5"
            value={selectedTeamId || 'default'}
          >
            {isLoadingTeamSchedule ? (
              <Skeleton />
            ) : (
              <div className="flex flex-auto max-h-68">
                <Table>
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
                              <TableRow
                                key={hourOfDay.absHourStr}
                                className="border-0"
                              >
                                <TableCell className=" text-xs text-center text-primary-foreground font-semibold font-mono border-b-1 bg-none">
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
                                          className={`text-center p-0.5 ${playerHourStatus.isAvailable ? 'bg-primary' : 'border-b-1 bg-none'}`}
                                        >
                                          {playerHourStatus.availablePlayers
                                            .size > 0 ? (
                                            teamScheduleSlotPopOver({
                                              playerHourStatus,
                                              hourOfDayStr,
                                              day,
                                            })
                                          ) : (
                                            <span className="text-muted-foreground font-extralight">
                                              {
                                                playerHourStatus
                                                  .availablePlayers.size
                                              }
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
