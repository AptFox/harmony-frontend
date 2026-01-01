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
import { HourOfDay, HourStatus, PlayerHourStatus, TimeOff } from '@/types/ScheduleTypes';
import { usePlayer, useUser } from '@/contexts';
import { TimeOffIcon } from '@/components/ui/timeOffIcon';
import { CalendarX2 } from 'lucide-react';
import React, {
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
import { createDayOfWeekToDatesMap, createHoursInDayArray, daysOfWeek, formatDate, isTimeOffFn } from '@/lib/scheduleUtils';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { Team } from '@/types/PlayerTypes';

export default function TeamScheduleTable() {
  const { user } = useUser();
  const twelveHourClock =
    user?.twelveHourClock === undefined ? true : user?.twelveHourClock;
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
  const { players } = usePlayer();
  const teams: Team[] = players ? players.map( (p) => p.team ).filter((team): team is Team => !!team) : []
  const firstTeamId = teams && teams[0].id
  const [selectedTeamId, setSelectedTeamId] = useState(firstTeamId ? firstTeamId : null);

  const { teamSchedule: selectedTeamSchedule, isLoading: isLoadingTeamSchedule } = useTeamSchedule(selectedTeamId);
  const playerSchedules = selectedTeamSchedule?.playerSchedules

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

  function createAvailabilityMap(): Map<HourOfDay, Map<string, PlayerHourStatus>> {
    const map = new Map<HourOfDay, Map<string, PlayerHourStatus>>();
    hoursInDay.forEach((hourOfDay) => {
      const availableDaysMap = map.get(hourOfDay) || new Map<string, PlayerHourStatus>();

      daysOfWeek.forEach((day) => {
        availableDaysMap.set(day, { isAvailable: false, isTimeOff: false, availablePlayers: new Set<string>() });
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
    startHour: number,
    endHour: number
  ) {
    const filterToHoursAvailableFn = (hourOfDay: HourOfDay) => {
      const hour = hourOfDay.hour;
      return hour >= startHour && hour <= endHour;
    };
    const hoursAvailable = hoursInDay
      .filter((hourOfDay) => filterToHoursAvailableFn(hourOfDay))

    hoursAvailable.forEach((hourOfDay) => {        
      const playerHourStatus = map.get(hourOfDay)?.get(dayOfWeek)
      if (!playerHourStatus) return

      const isTimeOff = isTimeOffFn(
        timeOffs,
        dayOfWeekToDatesMap,
        dayOfWeek,
        hourOfDay
      );
      if (isTimeOff) return;
      playerHourStatus.isAvailable = !isTimeOff
      playerHourStatus.availablePlayers.add(currentPlayerName)
      
      setFirstAvailableSlot(`${dayOfWeek}-${hourOfDay.absHourStr}`);
      map.get(hourOfDay)?.set(dayOfWeek, playerHourStatus);
    });
  }

  function setAvailabilityInMap(map: Map<HourOfDay, Map<string, PlayerHourStatus>>) {
    if (playerSchedules !== undefined) {
      playerSchedules.forEach((playerSchedule) => {
        const playerName = playerSchedule.playerName
        const weeklyAvailabilitySlotsForPlayer = playerSchedule.availability.weeklyAvailabilitySlots
        const timeOffsForPlayer = playerSchedule.availability.timeOffs
        daysOfWeek.forEach((day) => {
          const availabilitySlotsForDayOfWeek = weeklyAvailabilitySlotsForPlayer.filter(
            (slot) => slot.dayOfWeek === day
          );
          availabilitySlotsForDayOfWeek.forEach((slot) => {
            // We're operating on only slots that players are confirmed to be available
            const { startTime, endTime } = slot;
            const startHour = startTime.split(':').map(Number)[0];
            const endHour =
              endTime === '23:59:59' ? 24 : endTime.split(':').map(Number)[0];
            const overnight = endHour < startHour;
            if (!overnight) {
              setHourStatusInMap(map, playerName, timeOffsForPlayer, day, startHour, endHour);
            } else {
              // set hours until midnight
              setHourStatusInMap(map, playerName, timeOffsForPlayer, day, startHour, 23);
              // set hours after midnight
              const indexOfNextDay = daysOfWeek.findIndex((it) => it === day) + 1;
              const index =
                indexOfNextDay > daysOfWeek.length - 1 ? 0 : indexOfNextDay;
              const dayToSet = daysOfWeek[index];
              setHourStatusInMap(map, playerName, timeOffsForPlayer, dayToSet, 0, endHour);
            }
          });
        })
      })
    }
    return map;
  }

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  return (
    <DashboardCard
      title="Team Schedule"
      parentClassName="flex-auto basis-xs"
      childrenClassName="max-h-96 min-h-48"
    >
      { teams && (
        <Tabs value={selectedTeamId || undefined} onValueChange={setSelectedTeamId}>
          <TabsList>
            {teams.map(team => (
              <TabsTrigger key={team.organization.id} value={team.id}>
                {team.organization.acronym}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedTeamId || "default"}>
            {isLoadingTeamSchedule ? <Skeleton /> : 
              <div>
                This is where team availabilities will appear:
                {
                  Array.from(
                    availabilityMap.entries().map(([hourOfDay, mapOfPlayerHourStatus], i) => 
                      <div key={i}>
                        <div>
                          {
                          Array.from(
                            mapOfPlayerHourStatus.entries().map(([dayOfWeek, playerHourStatus], i) =>
                              <div key={i}>
                                <p key={dayOfWeek}>
                                  {hourOfDay.twelveHourStr} - {dayOfWeek}, isAvailable:{playerHourStatus.isAvailable.toString()}, availablePlayers: {[...playerHourStatus.availablePlayers].join(", ")}
                                </p>
                              </div>
                            )
                          )
                          }
                        </div>
                      </div>
                    )
                  )
                }
              </div>
            }
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
