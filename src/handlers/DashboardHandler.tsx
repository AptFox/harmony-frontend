'use client';
import { useUser, useAuth } from '@/contexts';
import { useToast } from '@/hooks/UseToast';
import { useEffect } from 'react';
import { isApiRateLimitError, isNoAccessTokenError } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useInitialTimeZone } from '@/hooks/useInitialTimeZone';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toZonedTime } from 'date-fns-tz';

export default function DashboardHandler() {
  // TODO: split this file into components
  const { user, avatarUrl, isLoading, isError } = useUser();
  const { logout } = useAuth();
  const { toast, tooManyRequestsToast } = useToast();
  useInitialTimeZone();

  useEffect(() => {
    if (isLoading) return;
    if (isNoAccessTokenError(isError)) return;
    if (isError) {
      // TODO: add logic that inspects the error and prints a standard pretty message
      if (isApiRateLimitError(isError)) {
        tooManyRequestsToast();
        return;
      }
      toast({
        title: (isError as Error).name,
        description: (isError as Error).message,
        variant: 'destructive',
      });
    }
  }, [user, isLoading, isError, toast, tooManyRequestsToast]);

// gradient snippet for schedule cells
// className="bg-[repeating-linear-gradient(45deg,#fafafa_0,#27272a_10px,#fafafa_10px,#fafafa_20px)]"
  // const userWeeklySchedule = user?.weeklySchedule;
  const userWeeklySchedule = [ // TODO: fetch user schedule from API
    {
      dayOfWeek: "Mon",
      startTime: "13:00:30",
      endTime: "23:59:59",  // TODO: handle end time at 00:00:00 next day
      timeZoneId: "America/New_York"
    },
    {
      dayOfWeek: "Tue",
      startTime: "13:00:00",
      endTime: "23:00:00",
      timeZoneId: "America/New_York"
    },
    {
      dayOfWeek: "Wed",
      startTime: "00:00:00",
      endTime: "05:00:00", // TODO: Figure out how to handle
      timeZoneId: "America/New_York"
    },
    {
      dayOfWeek: "Thur",
      startTime: "23:00:00",
      endTime: "03:00:00", // TODO: Figure out how to handle
      timeZoneId: "America/New_York"
    },
    {
      dayOfWeek: "Sun",
      startTime: "09:00:00",
      endTime: "17:02:17",
      timeZoneId: "America/New_York"
    }
  ];

  const daysOfWeek = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const frozenDate = new Date();

  const hoursInDay = Array.from({ length: 24 }, (_, i) => {
    const ampm = i < 12 ? 'AM' : 'PM';
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const str = `${hourString}:00 ${ampm}`;
    const rank = i >= 5 ? 0 : 1; // to enable sorting hours from 5am to 4am next day
    const time = new Date(frozenDate.getFullYear(), frozenDate.getMonth()-1, frozenDate.getDate(), i, 0); // current date with hour set to i
    return { str, time, rank }
  });

  function createAvailabilityMap():Map<string, Map<string, boolean>> {
    const map = new Map<string, Map<string, boolean>>();
    hoursInDay.sort((a,b) => a.rank - b.rank).forEach((hourOfDay) => {
      const availableDaysMap = map.get(hourOfDay.str) || new Map<string, boolean>();
      daysOfWeek.forEach((dayId) => {
        availableDaysMap.set(dayId, false);
      });
      map.set(hourOfDay.str, availableDaysMap);
    });
    return map;
  }

  function setAvailabilityInMap(map: Map<string, Map<string, boolean>>) {
      if (userWeeklySchedule !== undefined) {
        daysOfWeek.forEach((day) => {
          const slotsForDay = userWeeklySchedule.filter(slot => slot.dayOfWeek === day);
          slotsForDay.forEach((slot) => {
            const { startTime, endTime, timeZoneId } = slot;
            const [startHour, startMin, startSec] = startTime.split(':').map(Number);
            const [endHour, endMin, endSec] = endTime.split(':').map(Number);
            const startTimeAsDate = new Date(frozenDate.getFullYear(), frozenDate.getMonth()-1, frozenDate.getDate(), startHour, startMin, startSec)
            const endTimeAsDate = new Date(frozenDate.getFullYear(), frozenDate.getMonth()-1, frozenDate.getDate(), endHour, endMin, endSec)
            const zonedStartDate = toZonedTime(startTimeAsDate, timeZoneId);
            const zonedEndDate = toZonedTime(endTimeAsDate, timeZoneId);
            
            hoursInDay.filter(hourOfDay => {
              const hourTime = hourOfDay.time;
              return hourTime >= zonedStartDate && hourTime <= zonedEndDate;
            }).forEach((hourOfDay) => {
              map.get(hourOfDay.str)?.set(day, true);
            });
          });
        })
      };
      return map;
  };

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex flex-col justify-center space-y-2">
        {isLoading && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {isError && !isNoAccessTokenError(isError) && (
          <div>
            <p>Error loading user data</p>
          </div>
        )}
        {user && (
          <div className="flex flex-col justify-center space-y-2">
          <div className="flex justify-between items-center border rounded-lg bg-secondary shadow-md">
            <div className="p-2 flex-row flex min-w-sm">
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
              <div className="flex p-2 flex-row justify-between bg-secondary">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">Schedule</h2>
                </div>
                <Button>Update</Button>
              </div>
              <Separator />
              <div className="h-96 flex">
                <Table className="relative">
                  <TableHeader className="bg-secondary border-b">
                    <TableRow className="sticky top-0 flex h-6 ">
                      {daysOfWeek.map((day) => (
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
                    {availabilityMap && Array.from(availabilityMap.entries().map(([hourOfDay, dayOfWeekMap]) => (
                      <TableRow key={hourOfDay} className="flex">
                        {Array.from(dayOfWeekMap.entries().map( ([day, isAvailable]) => (
                          <TableCell key={`${day}-${hourOfDay}`} className={`flex-grow text-center ${isAvailable ? 'bg-primary' : '' }`}>
                            <span className={`text-sm ${isAvailable ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{hourOfDay}</span>
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
