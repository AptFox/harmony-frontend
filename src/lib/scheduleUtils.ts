import {
  AvailabilityMap,
  HourOfDay,
  HourStatus,
  ScheduleSlot,
  TimeOff,
  TimeZone,
} from '@/types/ScheduleTypes';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const getCurrentDate = () => new Date();

export const DAY_ORDER: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};
// daysOfWeek needs to exist in this sort order because Date.getDay() indexes at 0 with 'Sun' as the starting value
export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const sortedDaysOfWeek = [...daysOfWeek].sort(
  (a, b) => DAY_ORDER[a] - DAY_ORDER[b]
);

export const dayOfWeekToDatesMap = createDayOfWeekToDatesMap();

// Converts ScheduleSlot to target time zone
export const convertScheduleSlotToTimeZone = (
  scheduleSlot: ScheduleSlot,
  targetDate: Date,
  targetTimeZoneId: string | undefined = undefined
) => {
  const dateStr = targetDate.toISOString().split('T')[0];

  const convertSlotToTargetTimeZone = (time: string) => {
    const dateTimeStr = `${dateStr} ${time}`;
    const slotDate = fromZonedTime(dateTimeStr, scheduleSlot.timeZoneId);
    return targetTimeZoneId
      ? toZonedTime(slotDate, targetTimeZoneId)
      : slotDate;
  };

  return {
    startTimeInTargetTz: convertSlotToTargetTimeZone(scheduleSlot.startTime),
    endTimeInTargetTz: convertSlotToTargetTimeZone(scheduleSlot.endTime),
  };
};

// Falls back to the US locale
export const getCurrentUserLocale = (): string => {
  return typeof window !== 'undefined' ? window.navigator.language : 'en-US';
};

export const getCurrentTimeZoneId = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Converts an IANA timezone string to its current localized abbreviation.
 * Example: "America/New_York" -> "EDT" (in summer) or "EST" (in winter)
 */
export const getFormattedTimeZone = (
  timeZoneId?: string | undefined,
  locale: string = 'en-US'
): string => {
  const timeZone = timeZoneId || getCurrentTimeZoneId();
  return (
    Intl.DateTimeFormat(locale, {
      timeZone: timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value || timeZone
  );
};

/**
 * Returns the current date in the supplied timezone.
 */
export const getCurrentDateInTimeZone = (timeZoneId: string): Date => {
  const now = new Date();
  const localizedString = now.toLocaleString('en-US', {
    timeZone: timeZoneId,
    hour12: false,
  });

  return new Date(localizedString);
};

export const getTimeZones = (orgTimeZoneId: string | undefined): TimeZone[] => {
  const currentUserTimeZone: TimeZone = {
    displayValue: getFormattedTimeZone(getCurrentTimeZoneId()),
    timeZoneId: getCurrentTimeZoneId(),
  };
  const orgTimeZone: TimeZone | undefined = orgTimeZoneId
    ? {
        displayValue: getFormattedTimeZone(orgTimeZoneId),
        timeZoneId: orgTimeZoneId,
      }
    : undefined;
  const timeZones = [];
  timeZones.push(currentUserTimeZone);
  if (orgTimeZone && orgTimeZone.timeZoneId !== currentUserTimeZone.timeZoneId)
    timeZones.push(orgTimeZone);
  return timeZones;
};

export const formatDateToCurrentLocale = (
  date: Date | undefined,
  locale: string = getCurrentUserLocale(),
  options: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
  }
) => {
  const formatter = new Intl.DateTimeFormat(locale, options);

  return formatter.format(date);
};

export function createHoursInDayArray(): HourOfDay[] {
  const hoursInDayArr = Array.from({ length: 24 }, (_, i): HourOfDay => {
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const absHourStr = `${hourString}h`;
    const ampm = i < 12 ? 'am' : 'pm';
    let twelveHour = i > 12 ? i % 12 : i;
    if (twelveHour === 0) twelveHour = 12;
    const twelveHourStr = `${twelveHour}${ampm}`;
    return { absHourStr, twelveHourStr, hour: i };
  });

  hoursInDayArr.push({ absHourStr: '24h', twelveHourStr: '12am', hour: 24 });
  return hoursInDayArr;
}

export function getSelectedHourOfDay(
  selectedTime: string | undefined,
  hoursInDay: HourOfDay[]
): HourOfDay {
  if (selectedTime === undefined || selectedTime === '') return hoursInDay[0];
  const hod = hoursInDay.find((hour) => hour.hour.toString() === selectedTime);
  if (hod === undefined)
    throw Error(`No hour of day matches selection: ${selectedTime}`);
  return hod;
}

export function getPossibleEndTimes(
  selectedStartTime: string | undefined,
  hoursInDay: HourOfDay[]
): HourOfDay[] {
  const selectedHourOfDay = getSelectedHourOfDay(selectedStartTime, hoursInDay);
  const compareValue = selectedHourOfDay.hour;
  return hoursInDay.filter((hour) => hour.hour > compareValue);
}

export function getPossibleStartTimes(hoursInDay: HourOfDay[]): HourOfDay[] {
  return hoursInDay.filter((hod) => hod.hour !== 24);
}

export const getDayCurrentDayOfWeekStr = () =>
  daysOfWeek[getCurrentDate().getDay()];

export function createDayOfWeekToDatesMap(): Map<string, Date> {
  const map = new Map<string, Date>();
  const currentDate = getCurrentDate();
  for (let i = 0; i < 7; i++) {
    const dateForDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + i
    );
    const dayOfWeek = daysOfWeek[dateForDay.getDay()];
    map.set(dayOfWeek, dateForDay);
  }
  return map;
}

export function createEmptyAvailability(
  hoursInDay: HourOfDay[]
): AvailabilityMap {
  const map = new Map<HourOfDay, Map<string, HourStatus>>();
  hoursInDay.forEach((hourOfDay) => {
    const availableDaysMap =
      map.get(hourOfDay) || new Map<string, HourStatus>();
    sortedDaysOfWeek.forEach((day) => {
      availableDaysMap.set(day, { isAvailable: false, isTimeOff: false });
    });
    map.set(hourOfDay, availableDaysMap);
  });
  return map;
}

export function getAvailability(
  hoursInDay: HourOfDay[],
  scheduleSlots: ScheduleSlot[] | undefined,
  timeOffSlots: TimeOff[] | undefined,
  submittedScheduleMatchesCurrentTimeZone: boolean,
  setFirstAvailableSlot: (coordinate: string) => void
) {
  const map = createEmptyAvailability(hoursInDay);
  if (scheduleSlots !== undefined && submittedScheduleMatchesCurrentTimeZone) {
    sortedDaysOfWeek.forEach((dayOfWeek) => {
      const availabilitySlotsForDayOfWeek = scheduleSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );
      availabilitySlotsForDayOfWeek.forEach((slot) => {
        setHourStatusInMap(
          map,
          dayOfWeek,
          slot,
          timeOffSlots,
          hoursInDay,
          setFirstAvailableSlot
        );
      });
    });
  }
  return map;
}

export function setHourStatusInMap(
  map: Map<HourOfDay, Map<string, HourStatus>>,
  dayOfWeek: string,
  slot: ScheduleSlot,
  timeOffs: TimeOff[] | undefined,
  hoursInDay: HourOfDay[],
  setFirstAvailableSlot: (coordinate: string) => void
) {
  const targetDate = dayOfWeekToDatesMap.get(dayOfWeek);
  if (!targetDate) return;
  const { startTimeInTargetTz, endTimeInTargetTz } =
    convertScheduleSlotToTimeZone(slot, targetDate);
  const filterToHoursAvailableFn = (hourOfDay: HourOfDay) => {
    const hour = hourOfDay.hour;
    // TODO: consider putting hourOfDayOnTargetDate into the hourOfDay at creation
    const hourOfDayOnTargetDate = new Date(startTimeInTargetTz);
    hourOfDayOnTargetDate.setHours(hour);
    return (
      hourOfDayOnTargetDate >= startTimeInTargetTz &&
      hourOfDayOnTargetDate <= endTimeInTargetTz
    );
  };
  const hoursAvailable = hoursInDay.filter((hourOfDay) =>
    filterToHoursAvailableFn(hourOfDay)
  );

  hoursAvailable.forEach((hourOfDay) => {
    const hourStatus = map.get(hourOfDay)?.get(dayOfWeek) || {
      isAvailable: false,
      isTimeOff: false,
    };
    const isTimeOff = isTimeOffFn(
      timeOffs,
      dayOfWeekToDatesMap,
      dayOfWeek,
      hourOfDay
    );
    hourStatus.isTimeOff = isTimeOff;
    hourStatus.isAvailable = !isTimeOff;
    setFirstAvailableSlot(`${dayOfWeek}-${hourOfDay.absHourStr}`);
    map.get(hourOfDay)?.set(dayOfWeek, hourStatus);
  });
}

export function isTimeOffFn(
  timeOffSlots: TimeOff[] | undefined,
  dayOfWeekToDatesMap: Map<string, Date>,
  day: string,
  hourOfDay: HourOfDay
): boolean {
  if (timeOffSlots === undefined) return false;

  const dayDate = dayOfWeekToDatesMap.get(day);
  if (!dayDate) return false;

  //TODO: update this to use dates instead of numbers for determining isTimeOff
  const timeOffForDay = timeOffSlots.filter((timeOff) => {
    const timeOffStartDate = new Date(timeOff.startTime);
    const timeOffEndDate = new Date(timeOff.endTime);
    timeOffStartDate.setHours(0, 0, 0, 0);
    timeOffEndDate.setHours(23, 59, 59, 999);
    return dayDate >= timeOffStartDate && dayDate <= timeOffEndDate;
  });

  return timeOffForDay.some((timeOff) => {
    // TODO: consider switching to dates for this condition
    const startHour = new Date(timeOff.startTime).getHours();
    const endHour = timeOff.endTime.endsWith(':59:59.999Z')
      ? 24
      : new Date(timeOff.endTime).getHours();
    return hourOfDay.hour >= startHour && hourOfDay.hour <= endHour;
  });
}
