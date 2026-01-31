import { daysOfWeek } from '@/lib/availabilityUtils';
import { addDays } from 'date-fns';
import { Temporal } from '@js-temporal/polyfill';
import { ParsedScheduleSlot, ScheduleSlot } from '@/types/ScheduleTypes';

export const createTimeInZone = (
  targetDate: Date,
  targetTimeZoneId: string,
  timeStamp: string
): Date => {
  const [hour, minute, second] = timeStamp.split(':').map(Number);
  const plainDate = Temporal.PlainDate.from({
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1,
    day: targetDate.getDate(),
  });

  const targetDateInZone = plainDate.toZonedDateTime({
    timeZone: targetTimeZoneId,
    plainTime: { hour, minute, second },
  });

  return new Date(targetDateInZone.epochMilliseconds);
};

// returns a string representing the day of the week
// ex: "Sun"
export const getDayOfWeekInTargetTimeZone = (
  date: Date,
  targetTimeZoneId: string
): string => {
  const zonedStart = Temporal.Instant.fromEpochMilliseconds(
    date.getTime()
  ).toZonedDateTimeISO(targetTimeZoneId);
  return daysOfWeek[zonedStart.dayOfWeek % 7];
};

// Converts ScheduleSlot to target time zone
const convertTimeToTargetTimeZone = (
  originTime: string, // "07:00:00"
  originTimeZoneId: string, // "America/New_York"
  targetDate: Date, // date whose calendar day we want to use
  targetTimeZoneId: string // "America/Chicago"
): Date => {
  let [hour, minute, second] = originTime.split(':').map(Number);
  let dateToUse = targetDate;
  const isMidnight = hour === 23 && minute === 59 && second === 59;
  if (isMidnight) {
    hour = 0;
    minute = 0;
    second = 0;
    dateToUse = addDays(targetDate, 1);
  }

  const plainDate = Temporal.PlainDate.from({
    year: dateToUse.getFullYear(),
    month: dateToUse.getMonth() + 1,
    day: dateToUse.getDate(),
  });

  const originZonedDateTime = plainDate.toZonedDateTime({
    timeZone: originTimeZoneId,
    plainTime: { hour, minute, second },
  });

  const instant =
    originZonedDateTime.withTimeZone(targetTimeZoneId).epochMilliseconds;

  return new Date(instant);
};

export const convertScheduleSlotToTimeZone = (
  scheduleSlot: ScheduleSlot,
  targetDate: Date,
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
  targetDate: Date,
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
  dayOfWeekToDatesMap: Map<string, Date>,
  targetTimeZoneId: string
): ParsedScheduleSlot[] {
  return slots.map((slot) => {
    const targetDate = dayOfWeekToDatesMap.get(slot.dayOfWeek);
    if (!targetDate) throw Error('missing target date');
    return parseScheduleSlot(slot, targetDate, targetTimeZoneId);
  });
}
