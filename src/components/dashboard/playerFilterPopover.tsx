import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';
import { PlayerSchedule } from '@/types/ScheduleTypes';
import { Checkbox } from '@/components/ui/checkbox';

export default function PlayerFilterPopover(
  playerSchedules: PlayerSchedule[] | undefined,
  filteredPlayers: string[] | undefined,
  setFilteredPlayers: React.Dispatch<React.SetStateAction<string[] | undefined>>
) {
  const playersWithEmptySchedule = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length === 0
    )
    .map((player) => player.playerName);
  const playersWithSchedules = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length > 0
    )
    .map((player) => player.playerName);
  const playersDisplayedCount =
    playersWithSchedules?.length && filteredPlayers?.length
      ? playersWithSchedules?.length - filteredPlayers?.length
      : playersWithSchedules?.length || 0;
  return (
    <div className="p-1">
      <Popover>
        <PopoverTrigger asChild className="text-primary-foreground font-mono">
          <Button>
            <ListFilter />
            <span>{playersDisplayedCount}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className=" bg-secondary border-foreground border-4"
          align="center"
        >
          <PopoverArrow className="fill-foreground" />
          {playersWithSchedules && playersWithSchedules.length > 0 && (
            <div className="grid grid-cols-2">
              {playersWithSchedules.map((playerName) => (
                <div
                  key={`${playerName}-filter`}
                  className="flex flex-row items-center p-0.5"
                >
                  <Checkbox
                    checked={!filteredPlayers?.includes(playerName)}
                    onCheckedChange={() => {
                      if (filteredPlayers?.includes(playerName)) {
                        setFilteredPlayers(
                          filteredPlayers.filter((name) => name !== playerName)
                        );
                      } else {
                        setFilteredPlayers([
                          ...(filteredPlayers || []),
                          playerName,
                        ]);
                      }
                    }}
                    id={`${playerName}-toggle`}
                    className="h-6 w-6 border-secondary-foreground"
                  />
                  <span className="mx-1 text-sm truncate max-w-[10ch]">
                    {playerName}
                  </span>
                </div>
              ))}
            </div>
          )}
          {playersWithEmptySchedule && playersWithEmptySchedule.length > 0 && (
            <p className="font-mono">
              <span className="text-sm text-muted-foreground">
                No schedule set for:{' '}
              </span>
              <span className="text-sm">
                {playersWithEmptySchedule.join(', ')}
              </span>
            </p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
