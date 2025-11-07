export type ScheduleSlot = {
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
  weeklyAvailabilitySlots: ScheduleSlot[];
  availabilityExceptions: TimeOff[]
}

export type HourOfDay = { absHourStr: string, twelveHourStr: string, hour: number }
export type HourStatus = {isAvailable: boolean, isTimeOff: boolean}

export type ScheduleContextType = {
  availability: Availability | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};
