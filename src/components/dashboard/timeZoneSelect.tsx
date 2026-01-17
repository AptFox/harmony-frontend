import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlayerSchedule, TimeZone } from '@/types/ScheduleTypes';

export default function TimeZoneSelect({
  playerSchedules,
  timeZones,
  selectedTimeZoneId,
  setSelectedTimeZoneId,
}: {
  playerSchedules: PlayerSchedule[] | undefined;
  timeZones: TimeZone[];
  selectedTimeZoneId: string;
  setSelectedTimeZoneId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const teamHasNoSchedules =
    playerSchedules?.filter?.(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length > 0
    )?.length === 0;

  return (
    <div className="py-1">
      <Select
        disabled={teamHasNoSchedules || timeZones.length < 2}
        value={selectedTimeZoneId}
        onValueChange={setSelectedTimeZoneId}
      >
        <SelectTrigger className="w-23">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectGroup>
            {timeZones.map((timeZone) => (
              <SelectItem key={timeZone.timeZoneId} value={timeZone.timeZoneId}>
                {timeZone.displayValue}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
