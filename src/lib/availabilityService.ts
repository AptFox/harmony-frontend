import { daysOfWeek } from '@/lib/availabilityUtils';
import { Temporal } from '@js-temporal/polyfill';
import {
  DayOfWeekToDatesMap,
  ParsedScheduleSlot,
  ScheduleSlot,
} from '@/types/ScheduleTypes';

export const createTimeInZone = (
  targetDate: Temporal.ZonedDateTime,
  targetTimeZoneId: string,
  timeStamp: string
): Temporal.ZonedDateTime => {
  const [hour, minute, second] = timeStamp.split(':').map(Number);
  const zonedInstant = Temporal.Instant.fromEpochMilliseconds(
    targetDate.epochMilliseconds
  ).toZonedDateTimeISO(targetTimeZoneId);

  const plainDate = zonedInstant.toPlainDate();

  return plainDate.toZonedDateTime({
    timeZone: targetTimeZoneId,
    plainTime: { hour, minute, second },
  });
};

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

// Converts ScheduleSlot to target time zone
const convertTimeToTargetTimeZone = (
  originTime: string, // "07:00:00"
  originTimeZoneId: string, // "America/New_York"
  targetDate: Temporal.ZonedDateTime, // date whose calendar day we want to use
  targetTimeZoneId: string // "America/Chicago"
): Temporal.ZonedDateTime => {
  let [hour, minute, second] = originTime.split(':').map(Number);
  let dateToUse = targetDate;
  const isMidnight = hour === 23 && minute === 59 && second === 59;
  if (isMidnight) {
    hour = 0;
    minute = 0;
    second = 0;
    dateToUse = targetDate.add({ days: 1 });
  }

  const zonedInstant = Temporal.Instant.fromEpochMilliseconds(
    dateToUse.epochMilliseconds
  ).toZonedDateTimeISO(targetTimeZoneId);

  const plainDate = zonedInstant.toPlainDate();

  const originZonedDateTime = plainDate.toZonedDateTime({
    timeZone: originTimeZoneId,
    plainTime: { hour, minute, second },
  });

  return originZonedDateTime.withTimeZone(targetTimeZoneId);
};

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
