import { usePlayer } from '@/hooks/usePlayer';
import DashboardCard from '@/components/dashboard/dashboardCard';
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';

export default function PlayerCard({ orgId }: { orgId: string | undefined }) {
  const { player, isLoading } = usePlayer(orgId);
  const cardTitle = player ? `${player.name} Details` : 'Player Details';

  return (
    orgId && (
      <DashboardCard
        title={cardTitle}
        parentClassName="flex-auto max-w-[543px]"
        childrenClassName="max-h-96 min-h-54"
      >
        {isLoading ? (
          <ScheduleTableSkeleton />
        ) : (
          <div className="grid grid-cols-2 p-4 font-mono text-sm">
            <span>Organization:</span>
            <span>
              {player?.organization.name + ` (${player?.organization.acronym})`}
            </span>
            <span>Skill Group:</span>
            <span>{player?.team ? player.team.skillGroup.name : 'N/A'}</span>
            <span>Franchise:</span>
            <span>{player?.team ? player.team.franchise.name : 'N/A'}</span>
            <span>Player name:</span>
            <span>{player?.name}</span>
            <span>Team role:</span>
            <span>{player?.teamRole ? player.teamRole : 'Player'}</span>
            <span>Salary:</span>
            <span>{player?.salary ?? 'N/A'}</span>
            <span>Slot:</span>
            <span>{player?.slot ?? 'N/A'}</span>
            <span>Scrim points:</span>
            <span>{player?.currentScrimPoints ?? 'N/A'}</span>
            <span>Eligible through:</span>
            <span>{player?.eligibleThrough ?? 'N/A'}</span>
          </div>
        )}
      </DashboardCard>
    )
  );
}
