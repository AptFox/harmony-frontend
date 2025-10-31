'use client';
import { useUser, useAuth, useSchedule } from '@/contexts';
import { useToast } from '@/hooks/UseToast';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from '@/components/ui/table';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, avatarUrl, isLoading: isLoadingUser, isError: isErrorUser } = useUser();
  const { logout } = useAuth();
  const { toast, tooManyRequestsToast } = useToast();
  const { availability, isLoading: isLoadingAvailability, isError: isErrorAvailability } = useSchedule();
  useInitialTimeZone();

  useEffect(() => {
    if (isLoadingUser) return;
    if (isNoAccessTokenError(isErrorUser)) return;
    if (isErrorUser) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      if (isApiRateLimitError(isErrorUser)) {
        tooManyRequestsToast();
        return;
      }
      toast({
        title: (isErrorUser as Error).name,
        description: (isErrorUser as Error).message,
        variant: 'destructive',
      });
    }
  }, [user, isLoadingUser, isErrorUser, toast, tooManyRequestsToast]);

// gradient snippet for schedule cells
// className="bg-[repeating-linear-gradient(45deg,#fafafa_0,#27272a_10px,#fafafa_10px,#fafafa_20px)]"
  const userWeeklySchedule = availability?.weeklyAvailabilitySlots;
  // const userWeeklySchedule = [ // TODO: fetch user schedule from API
  //   {
  //     dayOfWeek: "Mon",
  //     startTime: "13:00:30",
  //     endTime: "23:59:59",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Tue",
  //     startTime: "13:00:00",
  //     endTime: "23:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Wed",
  //     startTime: "00:00:00",
  //     endTime: "05:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Thu",
  //     startTime: "23:00:00",
  //     endTime: "03:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Sun",
  //     startTime: "09:00:00",
  //     endTime: "17:02:17",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   }
  // ];

  const daysOfWeek = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const scheduleTimeZone = userWeeklySchedule ? userWeeklySchedule[0].timeZoneId : undefined
  const twelveHourClock = userWeeklySchedule ? userWeeklySchedule[0].twelveHourClock : false
  type HourOfDay = { absHourStr: string, twelveHourStr: string, hour: number, rank: number }

  const hoursInDay = Array.from({ length: 24 }, (_, i): HourOfDay => {
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const absHourStr = `${hourString}:00`;
    const ampm = i < 12 ? 'AM' : 'PM';
    let twelveHour = i>12 ? i % 12 : i
    if (twelveHour === 0) twelveHour = 12 
    const twelveHourStr = `${twelveHour}:00 ${ampm}`
    const rank = i >= 0 ? 0 : 1; // to enable sorting hours from 5am to 4am next day
    return { absHourStr, twelveHourStr, hour: i, rank }
  });

  function createAvailabilityMap():Map<HourOfDay, Map<string, boolean>> {
    const map = new Map<HourOfDay, Map<string, boolean>>();
    hoursInDay.sort((a,b) => a.rank - b.rank).forEach((hourOfDay) => {
      const availableDaysMap = map.get(hourOfDay) || new Map<string, boolean>();
      daysOfWeek.forEach((dayId) => {
        availableDaysMap.set(dayId, false);
      });
      map.set(hourOfDay, availableDaysMap);
    });
    return map;
  }

  function setAvailabilityInMap(map: Map<HourOfDay, Map<string, boolean>>) {
    if (userWeeklySchedule !== undefined) {
      daysOfWeek.forEach((day) => {
        const slotsForDay = userWeeklySchedule.filter(slot => slot.dayOfWeek === day);
        slotsForDay.forEach((slot) => {
          const { startTime, endTime } = slot;
          const startHour = startTime.split(':').map(Number)[0];
          const endHour = endTime.split(':').map(Number)[0];
          const overnight = endHour < startHour

          if (!overnight){
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= startHour && hour <= endHour;
            }).forEach((hourOfDay) => {
              map.get(hourOfDay)?.set(day, true);
            });
          } else {
            // set hours until midnight
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= startHour && hour <= 23;
            }).forEach((hourOfDay) => {
              map.get(hourOfDay)?.set(day, true);
            });
            // set hours after midnight
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= 0 && hour <= endHour;
            }).forEach((hourOfDay) => {
              const indexOfNextDay = daysOfWeek.findIndex((it) =>  it === day) + 1
              const index = indexOfNextDay > daysOfWeek.length - 1 ? 0 : indexOfNextDay
              const dayToSet = daysOfWeek[index]
              map.get(hourOfDay)?.set(dayToSet, true);
            });
          }
        });
      })
    };
    return map;
  };

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex flex-col justify-center space-y-2">
        {isLoadingUser && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {isErrorUser && !isNoAccessTokenError(isErrorUser) && (
          <div>
            <p>Error loading user data</p>
          </div>
        )}
        {user && (
          <div className="flex flex-col justify-center space-y-2">
          <div className="flex justify-between items-center border rounded-lg bg-secondary shadow-md">
            <div className="p-2 flex-row flex">
              <div className="my-2 mr-3 rounded-full border-primary-foreground border-3 max-w-fit">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={`${user.displayName}'s avatar`}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm">[team name]</p>
                <p className="text-sm">[team role]</p>
              </div>
            </div>
            <Button className="m-2" onClick={logout}>Logout</Button>
          </div>
        
          <div className="lg:flex lg:flex-row gap-2">
            <div className="flex flex-col p-2 rounded-lg border bg-secondary shadow-md lg:flex-grow mb-2">
              <div className="flex p-2 flex-row justify-between">
                <div className="flex items-center">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">Schedule</h2>
                  </div>
                </div>
                <Button>Update</Button>
              </div>
              <Separator />
              <div className="h-96 flex">
                <Table className="relative">
                  { scheduleTimeZone && (
                    <TableCaption>
                      TZ: {scheduleTimeZone}
                    </TableCaption>
                  )}
                  <TableHeader className="sticky top-0 bg-secondary">
                    <TableRow className="flex h-6">
                      {userWeeklySchedule &&  daysOfWeek.map((day) => (
                        <TableHead key={day} className="flex-grow h-6 text-center">{day}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    { !userWeeklySchedule && (
                      <div>
                        <div className="absolute inset-0 z-20 h-96 flex flex-col mb-4 items-center justify-center"> 
                          <h2 className="text-xl font-semibold">No schedule found</h2>
                          <h3 className="text-md font-semibold">Add one now!</h3>
                        </div>
                        <div className="absolute inset-0 z-10 flex flex-col h-full w-full items-center justify-center backdrop-blur" />
                      </div>
                    )}
                    {userWeeklySchedule && availabilityMap && Array.from(availabilityMap.entries().map(([hourOfDay, dayOfWeekMap]) => (
                      <TableRow key={hourOfDay.absHourStr} className="flex">
                        {Array.from(dayOfWeekMap.entries().map( ([day, isAvailable]) => (
                          <TableCell key={`${day}-${hourOfDay.absHourStr}`} className={`flex-grow text-center ${isAvailable ? 'bg-primary' : '' }`}>
                            <span className={`text-xs ${isAvailable ? 'text-primary-foreground font-semibold' : 'text-muted-foreground font-extralight'}`}>{twelveHourClock ? hourOfDay.twelveHourStr : hourOfDay.absHourStr}</span>
                          </TableCell>
                        )))}
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex flex-col p-2 rounded-lg border bg-secondary shadow-md lg:min-w-sm mb-2">
              <div className="flex p-2 flex-row justify-between bg-secondary">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">Time off</h2>
                </div>
                <Button>Add</Button>
              </div>
              <Separator />
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                [Time off Placeholder]
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
