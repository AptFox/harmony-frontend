import { HourOfDay } from "@/types/ScheduleTypes";

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

  hoursInDayArr.push({ absHourStr: '24h', twelveHourStr: '12am', hour: 24 })  
  return hoursInDayArr
}

export function getSelectedHourOfDay(selectedTime: string | undefined, hoursInDay: HourOfDay[]): HourOfDay {
  if (selectedTime === undefined || selectedTime === '') return hoursInDay[0]
  const hod = hoursInDay.find(
    (hour) => hour.hour.toString() === selectedTime
  );
  if (hod === undefined) throw Error(`No hour of day matches selection: ${selectedTime}`);
  return hod;
};

export function getPossibleEndTimes(selectedStartTime: string | undefined, hoursInDay: HourOfDay[]): HourOfDay[] {
  const selectedHourOfDay = getSelectedHourOfDay(selectedStartTime, hoursInDay);
  const compareValue = selectedHourOfDay.hour;
  return hoursInDay.filter((hour) => hour.hour > compareValue);
};

export function getPossibleStartTimes(hoursInDay: HourOfDay[]): HourOfDay[] {
  return hoursInDay.filter((hod) => hod.hour !== 24)
}