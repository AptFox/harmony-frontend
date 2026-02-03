import { Temporal } from '@js-temporal/polyfill';

export type ScheduleSlot = {
  id: string;
  userId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timeZoneId: string;
};

export type ParsedScheduleSlot = {
  dayOfWeek: string;
  startTimeInTargetTz: Temporal.ZonedDateTime;
  endTimeInTargetTz: Temporal.ZonedDateTime;
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
  timeOffs: TimeOff[];
};

export type HourOfDay = {
  absHourStr: string;
  twelveHourStr: string;
  hour: number;
};

export type PlayerHourStatus = {
  isAvailable: boolean;
  isTimeOff: boolean;
  availablePlayers: Set<string>;
};

export type ScheduleContextType = {
  availability: Availability | undefined;
  overwriteSchedule: (slots: ScheduleSlotRequest[]) => Promise<string[] | void>;
  deleteSchedule: () => Promise<void>;
  addTimeOff: (timeOff: TimeOffRequest) => Promise<string[] | void>;
  deleteTimeOff: (timeOff: TimeOff) => Promise<string[] | void>;
  isLoading: boolean;
  isError: Error | undefined;
};

export type PlayerSchedule = {
  playerId: number;
  playerName: string;
  availability: Availability;
};

export type TeamSchedule = {
  playerSchedules: PlayerSchedule[];
};

export type TeamScheduleContextType = {
  teamSchedule: TeamSchedule | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};

export type TimeZone = {
  displayValue: string;
  timeZoneId: string;
};

export type AvailabilityMap = Map<HourOfDay, Map<string, PlayerHourStatus>>;
export type DayOfWeekToDatesMap = Map<string, Temporal.ZonedDateTime>;
