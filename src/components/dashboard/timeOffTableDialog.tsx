'use client';

import { HourOfDay, TimeOffRequest } from '@/types/ScheduleTypes';
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Minus } from 'lucide-react';
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { useSchedule, useUser } from '@/contexts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '../ui/label';
import { CheckedState } from '@radix-ui/react-checkbox';
import { Calendar } from '../ui/calendar';
import { Textarea } from '../ui/textarea';
import { Matcher } from 'react-day-picker';

function createHoursInDayArray(): HourOfDay[] {
  return Array.from({ length: 24 }, (_, i): HourOfDay => {
    const hourString = i < 10 ? `0${i}` : `${i}`;
    const absHourStr = `${hourString}h`;
    const ampm = i < 12 ? 'am' : 'pm';
    let twelveHour = i > 12 ? i % 12 : i;
    if (twelveHour === 0) twelveHour = 12;
    const twelveHourStr = `${twelveHour}${ampm}`;
    return { absHourStr, twelveHourStr, hour: i };
  });
}

function addDaysToDate(initialDate: Date, daysToAdd: number): Date {
  const newDate = new Date(initialDate);
  newDate.setDate(newDate.getDate() + daysToAdd);
  
  return newDate;
}

const hoursInDay: HourOfDay[] = createHoursInDayArray();

export function TimeOffTableDialog({
  setDialogOpen,
}: {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const currentDate = new Date()
  const ninetyDaysFromToday = addDaysToDate(currentDate, 90)
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { user } = useUser();
  const {
    availability,
    addTimeOff,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useSchedule();
  const twelveHourClock = user?.twelveHourClock || true;
  const oldTimeOffRequests: TimeOffRequest[] = useMemo(() => {
    const timeOff = availability?.availabilityExceptions ?? [];
    return timeOff.map((timeOff) => {
      const fields = {
        startTime: timeOff.startTime,
        endTime: timeOff.endTime,
        comment: timeOff.comment,
      };
      const id = Object.values(fields).toString();
      return {
        ...fields,
        id: id,
      };
    });
  }, [availability]);
  const [selectedStartTime, setSelectedStartTime] = useState<
    string | undefined
  >('');
  const [selectedEndTime, setSelectedEndTime] = useState<string | undefined>(
    ''
  );
  const [isSendingToApi, setIsSendingToApi] = useState<boolean>(false);
  const [allDayChecked, setAllDayChecked] = useState<boolean | 'indeterminate'>(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [comment, setComment] = useState<string | undefined>(undefined)

  const clearInputFields = () => {
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedDate(undefined)
    setAllDayChecked(false)
    setComment(undefined)
  };


  function timeOffAlreadyScheduled(
    newRequest: TimeOffRequest,
    preExistingRequests: TimeOffRequest[]
  ): boolean {
    const preExistingRequest = preExistingRequests.find((request) => request.id === newRequest.id);
    return !!preExistingRequest
  }

  const getSelectedHourOfDay = (selectedTime: string | undefined): HourOfDay => {
    const hod = hoursInDay.find(
      (hour) => hour.hour.toString() === selectedTime
    );
    if (hod === undefined) throw Error('No hour of day matches selection.');
    return hod;
  };

  const getPossibleEndTimes = (): HourOfDay[] => {
    const selectedHourOfDay = selectedStartTime
      ? getSelectedHourOfDay(selectedStartTime)
      : hoursInDay[0];
    const compareValue = selectedHourOfDay.hour;
    return hoursInDay.filter((hour) => hour.hour > compareValue);
  };

  const save = async () => {
    const selectedStartHour = getSelectedHourOfDay(selectedStartTime);
    const selectedEndHour = getSelectedHourOfDay(selectedEndTime);
    selectedDate?.setHours(selectedStartHour.hour)
    const startTime = selectedDate?.toISOString()
    selectedDate?.setHours(selectedEndHour.hour)
    const endTime = selectedDate?.toISOString()
    // startTime needs to look like this: "2025-10-31T13:00:00.421Z"
    const fields = {
      startTime,
      endTime,
      comment,
    };
    const id = Object.values(fields).toString();
    const newRequest: TimeOffRequest = {
      ...fields,
      id: id
    }
    if (timeOffAlreadyScheduled(newRequest, oldTimeOffRequests)) {
      toast.info('Time off unchanged.');
      clearInputFields();
      setDialogOpen(false);
      return;
    }
    setIsSendingToApi(true);
    try {
      await addTimeOff(newRequest);
      setDialogOpen(false);
    } catch (error: unknown) {
      toast.error('TimeOff changes failed');
    }
    setIsSendingToApi(false);
  };

  function getFormattedHour(hour: HourOfDay): string {
    if (!twelveHourClock) {
      return hour.absHourStr;
    }
    return hour.twelveHourStr;
  }

  const checkAllDay = (checked: CheckedState) => {
    if (checked === true) {
      setSelectedStartTime('0');
      setSelectedEndTime('23');
    } else {
      setSelectedStartTime('');
      setSelectedEndTime('');
    }
    setAllDayChecked(checked);
  };

  const getSelectedDateStr = (): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    let formattedDateStr = 'N/A'
    if (selectedDate) {
      formattedDateStr = formatter.format(selectedDate)
    }

    return `Selected Date: ${formattedDateStr}`
  };

  const saveButtonDisabled = () => {
    return selectedDate === undefined || selectedStartTime === '' || selectedEndTime === ''
  }

  const disabledDaysMatcher: Matcher[] = [
    { before: currentDate },
    { after: ninetyDaysFromToday }
  ]

  return (
    <DialogContent className="lg:max-w-[425px] sm:max-w-[425px] bg-secondary">
      <DialogHeader>
        <DialogTitle>Add time off</DialogTitle>
      </DialogHeader>
      {!isLoadingAvailability && (
        <div className="flex">
          <Calendar
            className="w-full"
            disabled={disabledDaysMatcher}
            mode="single" // TODO: consider switching this to a range
            selected={selectedDate}
            startMonth={new Date(currentDate.getFullYear(), currentDate.getMonth())}
            endMonth={new Date(ninetyDaysFromToday.getFullYear(), ninetyDaysFromToday.getMonth())}
            captionLayout="dropdown-months"
            timeZone={currentTimeZone}
            onSelect={setSelectedDate}
          />
        </div>
      )}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs">{getSelectedDateStr()}</h3>
        <div className="flex flex-row gap-3 w-full justify-evenly">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center gap">
              <Select
                disabled={isLoadingAvailability || allDayChecked === true}
                value={selectedStartTime}
                onValueChange={(value) => setSelectedStartTime(value)}
              >
                <SelectTrigger className="max-w-fit">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="max-h-[325px] overflow-y-auto"
                >
                  <SelectGroup>
                    {hoursInDay.map((hour, i) => (
                      <SelectItem key={i} value={hour.hour.toString()}>
                        {getFormattedHour(hour)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="mx-1 flex flex-col h-full justify-center">
                <Minus />
              </span>
              <Select
                disabled={ isLoadingAvailability || selectedStartTime === '' || allDayChecked === true }
                value={selectedEndTime}
                onValueChange={(value) => setSelectedEndTime(value)}
              >
                <SelectTrigger className="max-w-fit">
                  <SelectValue placeholder="Until" />
                </SelectTrigger>
                <SelectContent
                  position="item-aligned"
                  className="max-h-[325px] max-w-fit overflow-y-auto"
                >
                  <SelectGroup>
                    {getPossibleEndTimes().map((hour, i) => (
                      <SelectItem key={i} value={hour.hour.toString()}>
                        {getFormattedHour(hour)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col h-full w-fit justify-center">
            <div className="flex flex-row items-start justify-center">
              <Checkbox
                checked={allDayChecked}
                onCheckedChange={checkAllDay}
                id="toggle"
                className="h-8 w-8 border-secondary-foreground"
              />
            </div>
            <Label htmlFor="toggle" className="text-xs">
              All day?
            </Label>
          </div>
        </div>
        <div className="grid w-full gap-3">
          <Label htmlFor="message">Add comment:</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add your notes about this time off here" id="comment" />
        </div>
      </div>

      <Separator />
      <DialogFooter className="flex gap-2">
        <DialogClose asChild>
          <Button
            variant="outline"
            onClick={clearInputFields}
            disabled={isSendingToApi}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          onClick={save}
          disabled={
            isSendingToApi || isLoadingAvailability || saveButtonDisabled()
          }
        >
          Save
          {isSendingToApi && <Spinner />}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
