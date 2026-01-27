import {
  AvailabilityMap,
  HourOfDay,
  PlayerHourStatus,
  ScheduleSlot,
  ShiftedScheduleSlot,
  TimeOff,
  TimeZone,
} from '@/types/ScheduleTypes';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { set, isWithinInterval, addDays, parse } from 'date-fns';

export const getCurrentTimeZoneId = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
export const getCurrentDate = (timeZoneId: string = getCurrentTimeZoneId()) =>
  toZonedTime(new Date(), timeZoneId);

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

export const getDayOfWeekToDatesMap = (
  timeZoneId: string = getCurrentTimeZoneId()
) => createDayOfWeekToDatesMap(timeZoneId);

const convertTimeToTargetTimeZone = (
  originTime: string,
  originTimeZoneId: string,
  targetDate: Date,
  targetTimeZoneId: string
) => {
  let parsedTime = parse(originTime, 'HH:mm:ss', targetDate);
  const isMidnight =
    parsedTime.getHours() === 23 &&
    parsedTime.getMinutes() === 59 &&
    parsedTime.getSeconds() === 59;

  if (isMidnight) {
    parsedTime = addDays(
      set(parsedTime, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
      1
    );
  }
  const hourInCurrentTimeZone = set(targetDate, {
    date: parsedTime.getDate(),
    hours: parsedTime.getHours(),
    minutes: parsedTime.getMinutes(),
    seconds: parsedTime.getSeconds(),
    milliseconds: parsedTime.getMilliseconds(),
  });
  const slotDateInCreatedTimeZone = fromZonedTime(
    hourInCurrentTimeZone,
    originTimeZoneId
  );
  return toZonedTime(slotDateInCreatedTimeZone, targetTimeZoneId);
};

// Converts ScheduleSlot to target time zone
export const convertScheduleSlotToTimeZone = (
  scheduleSlot: ScheduleSlot,
  targetDate: Date,
  targetTimeZoneId: string = getCurrentTimeZoneId()
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
  fromZonedTime(getCurrentDate(), timeZoneId);

export const getTimeZones = (orgTimeZoneId: string | undefined): TimeZone[] => {
  const currentUserTimeZoneId = getCurrentTimeZoneId();
  const currentUserTimeZone: TimeZone = {
    displayValue: getFormattedTimeZone(currentUserTimeZoneId),
    timeZoneId: currentUserTimeZoneId,
  };

  // Only add org timezone if it differs from user's timezone
  const orgTimeZone: TimeZone | undefined =
    orgTimeZoneId && orgTimeZoneId !== currentUserTimeZoneId
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

export function createDayOfWeekToDatesMap(
  timeZoneId: string
): Map<string, Date> {
  const currentDate = getCurrentDate(timeZoneId);
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

export function getShiftedSlot(
  slot: ScheduleSlot,
  timeZoneId: string,
  dayOfWeekToDatesMap: Map<string, Date>
): ShiftedScheduleSlot {
  const targetDate = dayOfWeekToDatesMap.get(slot.dayOfWeek);
  if (!targetDate) throw Error('missing target date');
  const { startTimeInTargetTz, endTimeInTargetTz } =
    convertScheduleSlotToTimeZone(slot, targetDate, timeZoneId);

  return {
    playerId: slot.playerId,
    dayOfWeek: daysOfWeek[startTimeInTargetTz.getDay()],
    startTimeInTargetTz,
    endTimeInTargetTz,
  };
}

export function getAvailability(
  hoursInDay: HourOfDay[],
  scheduleSlots: ScheduleSlot[] | undefined,
  timeOffSlots: TimeOff[] | undefined,
  submittedScheduleMatchesCurrentTimeZone: boolean,
  dayOfWeekToDatesMap: Map<string, Date>,
  setFirstAvailableSlot: (coordinate: string) => void
): AvailabilityMap {
  const map = createEmptyAvailability(hoursInDay);
  if (!scheduleSlots) return map;
  const shiftedSlots = scheduleSlots.map((slot) =>
    getShiftedSlot(slot, getCurrentTimeZoneId(), dayOfWeekToDatesMap)
  );
  if (submittedScheduleMatchesCurrentTimeZone) {
    sortedDaysOfWeek.forEach((dayOfWeek) => {
      const availabilitySlotsForDayOfWeek = shiftedSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeek
      );
      availabilitySlotsForDayOfWeek.forEach((slot) => {
        setHourStatusInMap(
          map,
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
  slot: ShiftedScheduleSlot,
  hoursInDay: HourOfDay[]
): HourOfDay[] {
  const { startTimeInTargetTz, endTimeInTargetTz } = slot;
  const filterToHoursAvailableFn = (hourOfDay: HourOfDay) => {
    const hour = hourOfDay.hour;

    const hourToCompare = set(new Date(startTimeInTargetTz), {
      hours: hour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    return isWithinInterval(hourToCompare, {
      start: startTimeInTargetTz,
      end: endTimeInTargetTz,
    });
  };
  return hoursInDay.filter((hourOfDay) => filterToHoursAvailableFn(hourOfDay));
}

export function setHourStatusInMap(
  map: AvailabilityMap,
  dayOfWeek: string,
  dayOfWeekToDatesMap: Map<string, Date>,
  slot: ShiftedScheduleSlot,
  timeOffs: TimeOff[] | undefined,
  hoursInDay: HourOfDay[],
  setFirstAvailableSlot: (coordinate: string) => void,
  isTeamScheduleTable: boolean = false,
  currentPlayerName: string | undefined = undefined
) {
  const targetDate = dayOfWeekToDatesMap.get(dayOfWeek);
  if (!targetDate) return;
  const hoursAvailable = filterToHoursAvailable(slot, hoursInDay);

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
