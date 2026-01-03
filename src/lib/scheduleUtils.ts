import { HourOfDay, TimeOff } from '@/types/ScheduleTypes';

export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDate = (date: Date | undefined) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
  });

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

export function createDayOfWeekToDatesMap(
  currentDate: Date
): Map<string, Date> {
  const map = new Map<string, Date>();
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

export function isTimeOffFn(
  timeOffSlots: TimeOff[] | undefined,
  dayOfWeekToDatesMap: Map<string, Date>,
  day: string,
  hourOfDay: HourOfDay
): boolean {
  if (timeOffSlots === undefined) return false;

  const dayDate = dayOfWeekToDatesMap.get(day);
  if (!dayDate) return false;

  const timeOffForDay = timeOffSlots.filter((timeOff) => {
    const startDate = new Date(timeOff.startTime);
    const endDate = new Date(timeOff.endTime);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return dayDate >= startDate && dayDate <= endDate;
  });

  return timeOffForDay.some((timeOff) => {
    const startHour = new Date(timeOff.startTime).getHours();
    const endHour = timeOff.endTime.endsWith(':59:59.999Z')
      ? 24
      : new Date(timeOff.endTime).getHours();
    return hourOfDay.hour >= startHour && hourOfDay.hour <= endHour;
  });
}
