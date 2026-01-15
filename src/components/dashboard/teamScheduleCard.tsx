import DashboardCard from '@/components/dashboard/dashboardCard';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';

export default function TeamScheduleCard({
  orgId,
}: {
  orgId: string | undefined;
}) {
  const { player } = usePlayer(orgId);
  const { teamSchedule, isLoading } = useTeamSchedule(player?.team?.id);
  const playerSchedules = teamSchedule?.playerSchedules;

  const playersWithNoAvailability = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length === 0
    )
    .map((player) => player.playerName);

  const playersWithNoAvailabilityPopOver = () => {
    return (
      playersWithNoAvailability &&
      playersWithNoAvailability.length > 0 && (
        <div className="p-1">
          <Popover>
            <PopoverTrigger
              asChild
              className="text-primary-foreground font-mono"
            >
              <Button size="sm">
                <span>Empty Schedules: </span>
                <span>{playersWithNoAvailability.length}</span>
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
                  {playersWithNoAvailability.join(', ')}
                </span>
              </p>
            </PopoverContent>
          </Popover>
        </div>
      )
    );
  };

  const cardTitle = player?.team?.name ? `${player?.team?.name}` : 'My Team';

  return (
    orgId && (
      <DashboardCard
        title={cardTitle}
        secondaryButton={playersWithNoAvailabilityPopOver}
        parentClassName="flex-auto max-w-135"
        childrenClassName="min-h-48"
      >
        {isLoading ? <Skeleton /> : <TeamScheduleTable team={player?.team} />}
      </DashboardCard>
    )
  );
}
