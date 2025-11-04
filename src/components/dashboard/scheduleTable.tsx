import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import DashboardCard from "@/components/dashboard/dashboardCard";
import { Availability } from "@/types/ScheduleTypes";
import { addDays } from 'date-fns';
import { TimeOffIcon } from "@/components/ui/timeOffIcon";

export default function ScheduleTable({ availability } : { availability: Availability | undefined} ){
  const userWeeklySchedule = availability?.weeklyAvailabilitySlots;
  // const timeOff = availability?.availabilityExceptions;
  const timeOff = [
    {
      id: 3,
      userId: "2a15d87d-99a3-4611-80f3-d7efd27e53a1",
      playerId: null,
      startTime: "2025-11-09T12:00:00.421Z",
      endTime: "2025-11-09T23:30:35.421Z",
      comment: "endTime is 8 hours after startTime",
    }
  ]
  // const userWeeklySchedule = [ // TODO: fetch user schedule from API
  //   {
  //     dayOfWeek: "Mon",
  //     startTime: "13:00:30",
  //     endTime: "23:59:59",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Tue",
  //     startTime: "13:00:00",
  //     endTime: "23:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Wed",
  //     startTime: "00:00:00",
  //     endTime: "05:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Thu",
  //     startTime: "23:00:00",
  //     endTime: "03:00:00",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   },
  //   {
  //     dayOfWeek: "Sun",
  //     startTime: "09:00:00",
  //     endTime: "17:02:17",
  //     timeZoneId: "America/New_York",
  //     twelveHourClock: false
  //   }
  // ];
  const scheduleTimeZone = userWeeklySchedule ? userWeeklySchedule[0].timeZoneId : undefined
  const twelveHourClock = userWeeklySchedule && userWeeklySchedule[0].twelveHourClock !== undefined ? userWeeklySchedule[0].twelveHourClock : true
  type HourOfDay = { absHourStr: string, twelveHourStr: string, hour: number }
  type HourStatus = {isAvailable: boolean, isTimeOff: boolean}
  const hoursInDay = Array.from({ length: 24 }, (_, i): HourOfDay => {
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const absHourStr = `${hourString}h`;
    const ampm = i < 12 ? 'am' : 'pm';
    let twelveHour = i>12 ? i % 12 : i
    if (twelveHour === 0) twelveHour = 12 
    const twelveHourStr = `${twelveHour}${ampm}`
    return { absHourStr, twelveHourStr, hour: i }
  });

  const daysOfWeek = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  // const daysOfWeekMap = new Map<number, string>([
  //   [0, "Sun"],
  //   [1, "Mon"],
  //   [2, "Tue"],
  //   [3, "Wed"],
  //   [4, "Thu"],
  //   [5, "Fri"],
  //   [6, "Sat"],
  // ]);

  function createDayOfWeekToDatesMap() {
    const currentDate = new Date()
    const map = new Map<string, Date>();
    for(let i = 0; i < 7; i++){
      const dateForDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i, currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
      const dayOfWeek = daysOfWeek[dateForDay.getDay()]
      map.set(dayOfWeek, dateForDay)
    }
    return map;
  }

  const dayOfWeekToDatesMap = createDayOfWeekToDatesMap()

  function isTimeOff(day: string, hourOfDay: HourOfDay): boolean {
    let isTimeOff = false;
    timeOff?.forEach((timeOff) => {
      const startDate = new Date(timeOff.startTime)
      const endDate = new Date(timeOff.endTime)
      const dayDate = dayOfWeekToDatesMap.get(day)
      if(dayDate && dayDate >= startDate && dayDate <= endDate){
        const startHour = startDate.getHours()
        const endHour = endDate.getHours()
        if (hourOfDay.hour >= startHour && hourOfDay.hour <= endHour){
          isTimeOff = true
        }
      }
    })
    return isTimeOff
  } 

  function createAvailabilityMap():Map<HourOfDay, Map<string, HourStatus>> {
    const map = new Map<HourOfDay, Map<string, HourStatus>>();
    hoursInDay.forEach((hourOfDay) => {
      const availableDaysMap = map.get(hourOfDay) || new Map<string, HourStatus>();
      daysOfWeek.forEach((dayId) => {
        availableDaysMap.set(dayId, { isAvailable: false, isTimeOff: false });
      });
      map.set(hourOfDay, availableDaysMap);
    });
    return map;
  }

  function setAvailabilityInMap(map: Map<HourOfDay, Map<string, HourStatus>>) {
    if (userWeeklySchedule !== undefined) {
      daysOfWeek.forEach((day) => {
        const slotsForDay = userWeeklySchedule.filter(slot => slot.dayOfWeek === day);
        slotsForDay.forEach((slot) => {
          const { startTime, endTime } = slot;
          const startHour = startTime.split(':').map(Number)[0];
          const endHour = endTime.split(':').map(Number)[0];
          const overnight = endHour < startHour
          if (!overnight){
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= startHour && hour <= endHour;
            }).forEach((hourOfDay) => {
              const hourStatus = map.get(hourOfDay)?.get(day) || { isAvailable: false, isTimeOff: false }
              hourStatus.isAvailable = true
              hourStatus.isTimeOff = isTimeOff(day, hourOfDay)
              map.get(hourOfDay)?.set(day, hourStatus);
            });
          } else {
            // set hours until midnight
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= startHour && hour <= 23;
            }).forEach((hourOfDay) => {
              const hourStatus = map.get(hourOfDay)?.get(day) || { isAvailable: false, isTimeOff: false }
              hourStatus.isAvailable = true
              hourStatus.isTimeOff = isTimeOff(day, hourOfDay)
              map.get(hourOfDay)?.set(day, hourStatus);
            });
            // set hours after midnight
            hoursInDay.filter(hourOfDay => {
              const hour = hourOfDay.hour;
              return hour >= 0 && hour <= endHour;
            }).forEach((hourOfDay) => {
              const indexOfNextDay = daysOfWeek.findIndex((it) =>  it === day) + 1
              const index = indexOfNextDay > daysOfWeek.length - 1 ? 0 : indexOfNextDay
              const dayToSet = daysOfWeek[index]
              const hourStatus = map.get(hourOfDay)?.get(day) || { isAvailable: false, isTimeOff: false }
              hourStatus.isAvailable = true
              hourStatus.isTimeOff = isTimeOff(day, hourOfDay)
              map.get(hourOfDay)?.set(dayToSet, hourStatus);
            });
          }
        });
      })
    };
    return map;
  };

  const availabilityMap = setAvailabilityInMap(createAvailabilityMap());

  return (
    <DashboardCard title="Schedule" buttonText="Update">
      { !userWeeklySchedule && (
        <div className="w-full overflow-auto">
          <div className="absolute inset-0 z-20 h-96 flex flex-col mb-4 items-center justify-center"> 
            <h2 className="text-xl font-semibold">No schedule found</h2>
            <h3 className="text-md font-semibold">Add one now!</h3>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col h-full w-full items-center justify-center backdrop-blur" />
        </div>
      )}
      { userWeeklySchedule && ( 
        <Table className="relative">
        { scheduleTimeZone && (
          <TableCaption>
            TZ: {scheduleTimeZone}
          </TableCaption>
        )}
        <TableHeader className="sticky top-0 bg-secondary">
          <TableRow className="h-6">
            {userWeeklySchedule &&  daysOfWeek.map((day) => (
              <TableHead key={day} className="h-6 text-center text-primary-foreground font-semibold font-mono">{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {userWeeklySchedule && availabilityMap && Array.from(availabilityMap.entries().map(([hourOfDay, dayOfWeekMap]) => (
            <TableRow key={hourOfDay.absHourStr} className="border-0">
              {Array.from(dayOfWeekMap.entries().map( ([day, hourStatus]) => (
                <TableCell key={`${day}-${hourOfDay.absHourStr}`} className={`text-center p-0.5 ${hourStatus.isAvailable ? 'bg-primary' : 'border-b-1 bg-none' }`}>
                  {!hourStatus.isTimeOff && (<span className={`text-xs ${hourStatus.isAvailable ? 'text-primary-foreground font-semibold font-mono' : 'text-muted-foreground font-extralight line-through'}`}>{twelveHourClock ? hourOfDay.twelveHourStr : hourOfDay.absHourStr}</span>)}
                  {hourStatus.isTimeOff && (
                    <div className="flex w-full h-full justify-center items-center">
                      <TimeOffIcon className="w-4 h-4" />
                    </div>
                  )}
                </TableCell>
              )))}
            </TableRow>
          )))}
        </TableBody>
      </Table>
      )}
    </DashboardCard>
  )
}