import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarX2 } from "lucide-react";
import { PlayerSchedule } from "@/types/ScheduleTypes";

export default function EmptySchedulePopover(
  playerSchedules: PlayerSchedule[] | undefined
) {
    const playersWithEmptySchedule = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length === 0
    )
    .map((player) => player.playerName);
  return (
      playersWithEmptySchedule &&
      playersWithEmptySchedule.length > 0 && (
        <div className="p-1">
          <Popover>
            <PopoverTrigger
              asChild
              className="text-primary-foreground font-mono"
            >
              <Button>
                <CalendarX2 />
                <span>{playersWithEmptySchedule.length}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-60 bg-secondary border-foreground border-4"
              align="center"
            >
              <PopoverArrow className="fill-foreground" />
              <p className="font-mono">
                <span className="text-sm text-muted-foreground">
                  No schedule set for:{' '}
                </span>
                <span className="text-sm">
                  {playersWithEmptySchedule.join(', ')}
                </span>
              </p>
            </PopoverContent>
          </Popover>
        </div>
      )
    );
}