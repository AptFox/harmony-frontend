import {
  AvailabilityMap,
  HourOfDay,
  PlayerHourStatus,
  ScheduleSlot,
  ParsedScheduleSlot,
  TimeOff,
  TimeZone,
} from '@/types/ScheduleTypes';
import { toZonedTime } from 'date-fns-tz';
import { isWithinInterval, addDays } from 'date-fns';
import {
  createTimeInZone,
  parseScheduleSlots,
} from '@/lib/availabilityService';

export const getCurrentTimeZoneId = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
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

// Falls back to the US locale
export const getCurrentUserLocale = (): string => {
  return typeof window !== 'undefined' ? window.navigator.language : 'en-US';
};

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
export const getCurrentDateInTimeZone = (timeZoneId: string): Date =>
  toZonedTime(getCurrentDate(), timeZoneId);

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

export function getDayOfWeekToDatesMap(timeZoneId: string): Map<string, Date> {
  const currentDate = getCurrentDateInTimeZone(timeZoneId);
  const map = new Map<string, Date>();
  for (let i = 0; i < 7; i++) {
    const dateForDay = addDays(currentDate, i);
    const dayOfWeek = daysOfWeek[dateForDay.getDay()];
    map.set(dayOfWeek, dateForDay);
  }
  return map;
}

export function createEmptyAvailability(
  hoursInDay: HourOfDay[]
): AvailabilityMap {
  // TODO: consider setting dates for each cell here based on selectedTimeZoneId
  const map = new Map<HourOfDay, Map<string, PlayerHourStatus>>();
  hoursInDay.forEach((hourOfDay) => {
    const availableDaysMap =
      map.get(hourOfDay) || new Map<string, PlayerHourStatus>();
    sortedDaysOfWeek.forEach((day) => {
      availableDaysMap.set(day, {
        isAvailable: false,
        isTimeOff: false,
        availablePlayers: new Set<string>(),
      });
    });
    map.set(hourOfDay, availableDaysMap);
  });
  return map;
}

export function getAvailability(
  timeZoneId: string,
  hoursInDay: HourOfDay[],
  scheduleSlots: ScheduleSlot[] | undefined,
  timeOffSlots: TimeOff[] | undefined,
  submittedScheduleMatchesCurrentTimeZone: boolean,
  dayOfWeekToDatesMap: Map<string, Date>,
  setFirstAvailableSlot: (coordinate: string) => void
): AvailabilityMap {
  const map = createEmptyAvailability(hoursInDay);
  if (!scheduleSlots) return map;
  const parsedSlots = parseScheduleSlots(
    scheduleSlots,
    dayOfWeekToDatesMap,
    timeZoneId
  );
  if (submittedScheduleMatchesCurrentTimeZone) {
    sortedDaysOfWeek.forEach((dayOfWeek) => {
      const availabilitySlotsForDayOfWeek = parsedSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );
      availabilitySlotsForDayOfWeek.forEach((slot) => {
        setHourStatusInMap(
          map,
          timeZoneId,
          dayOfWeek,
          dayOfWeekToDatesMap,
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

export function filterToHoursAvailable(
  timeZoneId: string,
  slot: ParsedScheduleSlot,
  hoursInDay: HourOfDay[],
  targetDate: Date
): HourOfDay[] {
  const { startTimeInTargetTz, endTimeInTargetTz } = slot;
  const filterToHoursAvailableFn = (hourOfDay: HourOfDay) => {
    const timeStamp = `${hourOfDay.hour}:00:00`;
    const hourToCompare = createTimeInZone(targetDate, timeZoneId, timeStamp);

    return isWithinInterval(hourToCompare, {
      start: startTimeInTargetTz,
      end: endTimeInTargetTz,
    });
  };
  return hoursInDay.filter((hourOfDay) => filterToHoursAvailableFn(hourOfDay));
}

export function setHourStatusInMap(
  map: AvailabilityMap,
  timeZoneId: string,
  dayOfWeek: string,
  dayOfWeekToDatesMap: Map<string, Date>,
  slot: ParsedScheduleSlot,
  timeOffs: TimeOff[] | undefined,
  hoursInDay: HourOfDay[],
  setFirstAvailableSlot: (coordinate: string) => void,
  isTeamScheduleTable: boolean = false,
  currentPlayerName: string | undefined = undefined
) {
  const targetDate = dayOfWeekToDatesMap.get(dayOfWeek);
  if (!targetDate) return;
  const hoursAvailable = filterToHoursAvailable(
    timeZoneId,
    slot,
    hoursInDay,
    targetDate
  );

  hoursAvailable.forEach((hourOfDay) => {
    const hourStatus = map.get(hourOfDay)?.get(dayOfWeek) || {
      isAvailable: false,
      isTimeOff: false,
      availablePlayers: new Set<string>(),
    };
    const isTimeOff = isTimeOffFn(
      timeOffs,
      dayOfWeekToDatesMap,
      dayOfWeek,
      hourOfDay
    );
    if (isTeamScheduleTable && isTimeOff) return;
    hourStatus.isTimeOff = isTimeOff;
    hourStatus.isAvailable = !isTimeOff;
    if (currentPlayerName) hourStatus.availablePlayers.add(currentPlayerName);
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

  // TODO: update this to use temporal dates instead of numbers for determining isTimeOff
  // TODO: update this to account for timezones
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
