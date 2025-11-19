export type ScheduleSlot = {
  id: string;
  userId: string;
  playerId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
};

export type ScheduleSlotRequest = {
  id: string;
  rank: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
};

export type TimeOff = {
  id: string;
  userId: string;
  playerId: string | undefined;
  startTime: string;
  endTime: string;
  comment: string | undefined;
};

export type TimeOffRequest = {
  id: string | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  comment: string | undefined;
};

export type Availability = {
  weeklyAvailabilitySlots: ScheduleSlot[];
  availabilityExceptions: TimeOff[];
};

export type HourOfDay = {
  absHourStr: string;
  twelveHourStr: string;
  hour: number;
};
export type HourStatus = { isAvailable: boolean; isTimeOff: boolean };

export type ScheduleContextType = {
  availability: Availability | undefined;
  overwriteSchedule: (slots: ScheduleSlotRequest[]) => Promise<void>;
  deleteSchedule: () => Promise<void>;
  addTimeOff: (timeOff: TimeOffRequest) => Promise<void>;
  deleteTimeOff: (timeOff: TimeOff) => Promise<void>;
  isLoading: boolean;
  isError: Error | undefined;
};
