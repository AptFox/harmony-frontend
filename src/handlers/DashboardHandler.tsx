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

  const dayOfWeek = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  const hoursInDay = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    const hourString = hour > 9 ? hour.toString(): `0${i % 12}`;
    return `${hourString}:00 ${ampm}`;
  });

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex flex-col justify-center space-y-2">
        {isLoading && (
          <div>
            <p>Dashboard loading...</p>
          </div>
        )}
        {user && (
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
        )}
        {isError && !isNoAccessTokenError(isError) && (
          <div>
            <p>Error loading user data</p>
          </div>
        )}
        <div className="lg:flex lg:flex-row gap-2">
          <div className="flex flex-col p-2 rounded-lg border bg-secondary shadow-md lg:flex-grow mb-2">
            <div className="flex p-2 flex-row justify-between bg-secondary">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Weekly Availability</h2>
              </div>
              <Button>Update</Button>
            </div>
            <Separator />
            <div className="h-96 flex">
              <Table>
                <TableHeader className="flex h-6">
                    <TableHead className="lg:w-22 h-6 text-center">Hour</TableHead>
                    {dayOfWeek.map((day) => (
                      <TableHead key={day} className="flex-grow h-6 text-center">{day}</TableHead>
                    ))}
                </TableHeader>
                <Separator /> 
                <TableBody>
                  {hoursInDay.map((hour) => (
                    <TableRow key={hour} className="flex h-6">
                      <TableCell className="flex h-6 lg:w-22 text-center">{hour}</TableCell>
                      {dayOfWeek.map((day) => (
                        <TableCell key={day} className="flex-grow h-6 text-center rounded-lg border border-secondary bg-primary" />
                      ))}
                    </TableRow>
                  ))}
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
    </div>
  );
}
