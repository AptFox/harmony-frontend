'use client';

import { HourOfDay, ScheduleSlotRequest } from '@/types/ScheduleTypes';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { ChevronDown, PlusIcon, X, Minus, ClockAlert } from 'lucide-react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
} from '@/components/ui/item';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useSchedule, useUser } from '@/contexts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckedState } from '@radix-ui/react-checkbox';
import {
  getPossibleEndTimes,
  getPossibleStartTimes,
  getSelectedHourOfDay,
} from '@/lib/scheduleUtils';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayRank: Map<string, number> = new Map<string, number>([
  ['Sun', 0],
  ['Mon', 1],
  ['Tue', 2],
  ['Wed', 3],
  ['Thu', 4],
  ['Fri', 5],
  ['Sat', 6],
]);

export function ScheduleTableDialog({
  hoursInDay,
  setDialogOpen,
}: {
  hoursInDay: HourOfDay[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useUser();
  const {
    availability,
    isLoading: isLoadingAvailability,
    overwriteSchedule,
    deleteSchedule,
  } = useSchedule();
  const twelveHourClock = user?.twelveHourClock ?? true;
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const oldScheduleSlots: ScheduleSlotRequest[] = useMemo(() => {
    const scheduleSlots = availability?.weeklyAvailabilitySlots ?? [];
    return scheduleSlots.map((slot) => {
      const fields = {
        rank: dayRank.get(slot.dayOfWeek) || 0,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeZoneId: currentTimeZone,
      };
      const id = Object.values(fields).toString();
      return {
        ...fields,
        id: id,
      };
    });
  }, [currentTimeZone, availability]);
  const [daysSelectorOpen, setDaysSelectorOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [updatedScheduleSlots, setUpdatedScheduleSlots] = useState<
    ScheduleSlotRequest[]
  >([]);
  const [selectedStartTime, setSelectedStartTime] = useState<
    string | undefined
  >('');
  const [selectedEndTime, setSelectedEndTime] = useState<string | undefined>(
    ''
  );
  const [isSendingToApi, setIsSendingToApi] = useState<boolean>(false);
  const [scheduleModified, setScheduleModified] = useState<boolean>(false);
  const [everyDayChecked, setEveryDayChecked] = useState<
    boolean | 'indeterminate'
  >(false);
  const addButtonDisabled =
    selectedDays.length < 1 ||
    selectedStartTime === '' ||
    selectedEndTime === '';

  useEffect(() => {
    setUpdatedScheduleSlots(oldScheduleSlots);
  }, [oldScheduleSlots, setUpdatedScheduleSlots]);

  const toggleSelection = (day: string) => {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter((d) => d !== day);
      } else {
        return [...currentDays, day];
      }
    });
  };

  const clearInputFields = () => {
    setSelectedDays([]);
    setSelectedStartTime('');
    setSelectedEndTime('');
    setEveryDayChecked(false);
  };

  const resetDialog = () => {
    clearInputFields();
    setScheduleModified(false);
    setUpdatedScheduleSlots(oldScheduleSlots);
  };

  const generateSelectedTimeString = (selectedTime: string): string => {
    if (selectedTime === '24') {
      return `23:59:59`;
    }

    const hourOfDay = getSelectedHourOfDay(selectedTime, hoursInDay);
    const hourStr = hourOfDay.absHourStr.slice(0, 2);
    return `${hourStr}:00:00`;
  };

  const addScheduleSlot = () => {
    if (selectedDays.length === 0 || !selectedStartTime || !selectedEndTime) {
      toast.error('You are missing required fields');
      return;
    }
    const newScheduleSlots: ScheduleSlotRequest[] = [];
    selectedDays.forEach((dayOfWeek) => {
      const startTime = generateSelectedTimeString(selectedStartTime);
      const endTime = generateSelectedTimeString(selectedEndTime);
      const fields = {
        rank: dayRank.get(dayOfWeek) || 0,
        dayOfWeek,
        startTime,
        endTime,
        timeZoneId: currentTimeZone,
      };
      const id = Object.values(fields).toString();
      if (updatedScheduleSlots.find((slot) => slot.id === id) === undefined) {
        newScheduleSlots.push({
          ...fields,
          id: id,
        });
        setScheduleModified(true);
      } else {
        const startHour = getSelectedHourOfDay(selectedStartTime, hoursInDay);
        const endHour = getSelectedHourOfDay(selectedEndTime, hoursInDay);
        const startHourStr = twelveHourClock
          ? startHour.twelveHourStr
          : startHour.absHourStr;
        const endHourStr = twelveHourClock
          ? endHour.twelveHourStr
          : endHour.absHourStr;
        toast.error(
          `Duplicate(s) detected. ${dayOfWeek}, (${startHourStr} - ${endHourStr}) already in schedule.`
        );
      }
    });

    setUpdatedScheduleSlots(
      updatedScheduleSlots
        .concat(newScheduleSlots)
        .sort((a, b) => a.rank - b.rank)
    );
    clearInputFields();
  };

  function scheduleSlotsAreEqual(
    slotsA: ScheduleSlotRequest[],
    slotsB: ScheduleSlotRequest[]
  ): boolean {
    if (slotsA.length !== slotsB.length) return false;
    let aStr = '';
    let bStr = '';
    slotsA
      .sort((a, b) => a.rank - b.rank)
      .forEach((a) => {
        aStr = aStr.concat(a.id);
      });
    slotsB
      .sort((a, b) => a.rank - b.rank)
      .forEach((b) => {
        bStr = bStr.concat(b.id);
      });
    return aStr === bStr;
  }

  const save = async () => {
    if (scheduleSlotsAreEqual(oldScheduleSlots, updatedScheduleSlots)) {
      toast.info('Schedule unchanged.');
      resetDialog();
      setDialogOpen(false);
      return;
    }
    setIsSendingToApi(true);
    try {
      if (updatedScheduleSlots.length === 0) {
        await deleteSchedule();
      } else {
        const response = await overwriteSchedule(updatedScheduleSlots);
        if (response) {
          toast.error(response.toString());
        } else {
          setDialogOpen(false);
        }
      }
    } catch (error: unknown) {
      toast.error('Schedule update failed');
    }
    setIsSendingToApi(false);
  };

  const removeSlot = (slot: ScheduleSlotRequest) => {
    const newSlots = updatedScheduleSlots.filter((s) => s.id !== slot.id);
    setUpdatedScheduleSlots(newSlots);
    const scheduleSlotsModified = !scheduleSlotsAreEqual(
      oldScheduleSlots,
      newSlots
    );
    setScheduleModified(scheduleSlotsModified);
  };

  function getFormattedTimeSlot(slot: ScheduleSlotRequest): string {
    const { startTime, endTime } = slot;
    const startHour = startTime.split(':').map(Number)[0];
    const endHour =
      endTime === '23:59:59' ? 24 : endTime.split(':').map(Number)[0];
    const startHourOfDay = hoursInDay.find((hour) => hour.hour === startHour);
    const endHourOfDay = hoursInDay.find((hour) => hour.hour === endHour);

    const startHourStr = !twelveHourClock
      ? startHourOfDay?.absHourStr
      : startHourOfDay?.twelveHourStr;
    const endHourStr = !twelveHourClock
      ? endHourOfDay?.absHourStr
      : endHourOfDay?.twelveHourStr;

    return `${startHourStr} - ${endHourStr}`;
  }

  function getFormattedHour(hour: HourOfDay): string {
    if (!twelveHourClock) {
      return hour.absHourStr;
    }
    return hour.twelveHourStr;
  }

  const checkEveryDay = (checked: CheckedState) => {
    if (checked === true) {
      setSelectedDays(daysOfWeek);
    } else {
      setSelectedDays([]);
    }
    setEveryDayChecked(checked);
  };

  const getSelectedDaysString = (): string => {
    if (selectedDays.length > 0) {
      if (selectedDays.length === 7) return 'Every day';
      return selectedDays
        .sort((a, b) => (dayRank.get(a) ?? 1) - (dayRank.get(b) ?? 0))
        .toString();
    }
    return 'Select days';
  };

  return (
    <DialogContent className="lg:max-w-fit sm:max-w-[425px] bg-secondary">
      <DialogHeader>
        <DialogTitle>Update schedule</DialogTitle>
        <DialogDescription>
          Updating your schedule overwrites your previous schedule.
        </DialogDescription>
      </DialogHeader>
      {!isLoadingAvailability && (
        <ScrollArea
          type="auto"
          className="flex flex-row border-y-2 max-w-[425px] h-[200px] relative"
        >
          {/* Gradient Overlay for the top edge */}
          {updatedScheduleSlots.length > 4 && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-background/30 to-background/0 z-10 pointer-events-none" />
          )}

          {/* Gradient Overlay for the bottom edge */}
          {updatedScheduleSlots.length > 4 && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-background/30 to-background/0 z-10 pointer-events-none" />
          )}
          {updatedScheduleSlots.length === 0 && (
            <Empty className="h-full w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClockAlert />
                </EmptyMedia>
                <EmptyTitle>No Schedule set</EmptyTitle>
                <EmptyDescription>
                  You will appear as unavailable.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {updatedScheduleSlots.length > 0 && (
            <ItemGroup className="grid min-h-full lg:grid-cols-2 sm:grid-cols-1 gap-2 lg:max-w-fit py-2">
              {updatedScheduleSlots?.map((slot) => (
                <Item
                  key={slot.id}
                  variant="outline"
                  size="sm"
                  className="border-2 p-1 min-w-fit "
                >
                  <ItemContent className="flex flex-row">
                    <div className="flex flex-col justify-center w-fit p-1 pr-2 text-primary-foreground font-semibold font-mono border-r-2 border-primary-foreground">{`${slot.dayOfWeek}`}</div>
                    <div className="flex flex-col justify-center w-full text-center grow p-2 text-primary-foreground font-semibold font-mono">
                      {getFormattedTimeSlot(slot)}
                    </div>
                  </ItemContent>
                  <ItemActions>
                    <Button size="sm" onClick={() => removeSlot(slot)}>
                      <X className="bg-primary" />
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </ScrollArea>
      )}
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-3 w-full justify-evenly">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row h-full w-full justify-center gap-3">
              <DropdownMenu
                modal={true}
                open={daysSelectorOpen}
                onOpenChange={setDaysSelectorOpen}
              >
                <DropdownMenuTrigger
                  asChild
                  className="min-w-45 lg:max-w-fit sm:max-w-[150px]"
                >
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between px-3"
                  >
                    <span
                      className={`lg:max-w-full sm:max-w-[150px] ${selectedDays.length > 0 ? 'text-primary-foreground' : 'text-muted-foreground'} text-sm truncate`}
                    >
                      {getSelectedDaysString()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="lg:max-w-full sm:max-w-[150px]"
                >
                  <DropdownMenuGroup>
                    {daysOfWeek.map((day) => (
                      <DropdownMenuCheckboxItem
                        className="focus:bg-primary"
                        key={day}
                        checked={selectedDays.includes(day)}
                        onCheckedChange={() => toggleSelection(day)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {day}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex justify-center gap">
              <Select
                disabled={isLoadingAvailability}
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
                    {getPossibleStartTimes(hoursInDay).map((hour, i) => (
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
                disabled={isLoadingAvailability || selectedStartTime === ''}
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
                    {getPossibleEndTimes(selectedStartTime, hoursInDay).map(
                      (hour, i) => (
                        <SelectItem key={i} value={hour.hour.toString()}>
                          {getFormattedHour(hour)}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col h-full w-fit justify-center">
            <div className="flex flex-row items-start justify-center">
              <Checkbox
                checked={everyDayChecked}
                onCheckedChange={checkEveryDay}
                id="toggle"
                className="h-8 w-8 border-secondary-foreground"
              />
            </div>
            <Label htmlFor="toggle" className="text-xs">
              Every day?
            </Label>
          </div>
        </div>

        <div className="flex flex-col h-full w-fit justify-center">
          <Button
            onClick={addScheduleSlot}
            disabled={isLoadingAvailability || addButtonDisabled}
          >
            Add
            <PlusIcon />
          </Button>
        </div>
      </div>

      <Separator />
      <DialogFooter className="flex gap-2">
        <DialogClose asChild>
          <Button
            variant="outline"
            onClick={resetDialog}
            disabled={isSendingToApi}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          onClick={save}
          disabled={
            isSendingToApi || !scheduleModified || isLoadingAvailability
          }
        >
          Save
          {isSendingToApi && <Spinner />}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
