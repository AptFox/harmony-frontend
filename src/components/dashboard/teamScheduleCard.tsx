import DashboardCard from '@/components/dashboard/dashboardCard';
import EmptySchedulePopover from '@/components/dashboard/emptySchedulePopover';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
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

  const cardTitle = player?.team?.name ? `${player?.team?.name}` : 'My Team';

  return (
    orgId &&
    player?.team && (
      <DashboardCard
        title={cardTitle}
        secondaryButton={() =>
          EmptySchedulePopover(teamSchedule?.playerSchedules)
        }
        parentClassName="flex-auto max-w-135"
        childrenClassName="min-h-48"
      >
        {isLoading ? <Skeleton /> : <TeamScheduleTable team={player?.team} />}
      </DashboardCard>
    )
  );
}
