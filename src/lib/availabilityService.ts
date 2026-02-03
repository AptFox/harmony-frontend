import { daysOfWeek } from '@/lib/availabilityUtils';
import { Temporal } from '@js-temporal/polyfill';
import {
  DayOfWeekToDatesMap,
  ParsedScheduleSlot,
  ScheduleSlot,
} from '@/types/ScheduleTypes';

// returns a string representing the day of the week
// ex: "Sun"
export const getDayOfWeekInTargetTimeZone = (
  date: Temporal.ZonedDateTime,
  targetTimeZoneId: string
): string => {
  const zonedStart = Temporal.Instant.fromEpochMilliseconds(
    date.epochMilliseconds
  ).toZonedDateTimeISO(targetTimeZoneId);
  return daysOfWeek[zonedStart.dayOfWeek % 7];
};

function convertTimeToTargetTimeZone(
  originTime: string,
  originTz: string,
  originDate: Temporal.ZonedDateTime,
  targetTz: string
): Temporal.ZonedDateTime {
  const [hour, minute, second] = originTime.split(':').map(Number);

  const originZdt = Temporal.ZonedDateTime.from({
    timeZone: originTz,
    year: originDate.year,
    month: originDate.month,
    day: originDate.day,
    hour,
    minute,
    second,
  });

  return originZdt.withTimeZone(targetTz);
}

export const convertScheduleSlotToTimeZone = (
  scheduleSlot: ScheduleSlot,
  targetDate: Temporal.ZonedDateTime,
  targetTimeZoneId: string
) => {
  const startTimeInTargetTz = convertTimeToTargetTimeZone(
    scheduleSlot.startTime,
    scheduleSlot.timeZoneId,
    targetDate,
    targetTimeZoneId
  );
  const endTimeInTargetTz = convertTimeToTargetTimeZone(
    scheduleSlot.endTime,
    scheduleSlot.timeZoneId,
    targetDate,
    targetTimeZoneId
  );

  return {
    startTimeInTargetTz,
    endTimeInTargetTz,
  };
};

export function parseScheduleSlot(
  slot: ScheduleSlot,
  targetDate: Temporal.ZonedDateTime,
  targetTimeZoneId: string
): ParsedScheduleSlot {
  const { startTimeInTargetTz, endTimeInTargetTz } =
    convertScheduleSlotToTimeZone(slot, targetDate, targetTimeZoneId);

  const dayOfWeek = getDayOfWeekInTargetTimeZone(
    startTimeInTargetTz,
    targetTimeZoneId
  );

  return {
    dayOfWeek,
    startTimeInTargetTz,
    endTimeInTargetTz,
  };
}

export function parseScheduleSlots(
  slots: ScheduleSlot[],
  dayOfWeekToDatesMap: DayOfWeekToDatesMap,
  targetTimeZoneId: string
): ParsedScheduleSlot[] {
  return slots.map((slot) => {
    const targetDate = dayOfWeekToDatesMap.get(slot.dayOfWeek);
    if (!targetDate) throw Error('missing target date');
    return parseScheduleSlot(slot, targetDate, targetTimeZoneId);
  });
}
