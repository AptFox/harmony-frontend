export type Schedule = {
  id: string;
  userId: string;
  playerId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
  twelveHourClock: boolean
};

export type TimeOff = {
  id: string;
  userId: string;
  playerId: string;
  startTime: string;
  endTime: string;
  comment: string;
}

export type Availability = {
  weeklyAvailabilitySlots: Schedule[];
  availabilityExceptions: TimeOff[]
}

export type ScheduleContextType = {
  availability: Availability | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};
