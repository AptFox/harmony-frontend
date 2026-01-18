import DashboardCard from '@/components/dashboard/dashboardCard';
import EmptySchedulePopover from '@/components/dashboard/emptySchedulePopover';
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import TimeZoneSelect from '@/components/dashboard/timeZoneSelect';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { getCurrentTimeZoneId, getTimeZones } from '@/lib/scheduleUtils';
import { TimeZone } from '@/types/ScheduleTypes';
import { useState } from 'react';

export default function TeamScheduleCard({
  orgId,
  orgTimeZoneId,
}: {
  orgId: string | undefined;
  orgTimeZoneId: string | undefined;
}) {
  const { player } = usePlayer(orgId);
  const { teamSchedule, isLoading } = useTeamSchedule(player?.team?.id);
  const cardTitle = player?.team?.name ? `${player?.team?.name}` : 'My Team';
  const [selectedTimeZoneId, setSelectedTimeZoneId] = useState(
    getCurrentTimeZoneId()
  );
  const timeZones: TimeZone[] = getTimeZones(orgTimeZoneId);
  const playerSchedules = teamSchedule?.playerSchedules;
  const timeZoneSelect = () => {
    return (
      <TimeZoneSelect
        playerSchedules={playerSchedules}
        timeZones={timeZones}
        selectedTimeZoneId={selectedTimeZoneId}
        setSelectedTimeZoneId={setSelectedTimeZoneId}
      />
    );
  };

  return (
    orgId &&
    player?.team && (
      <DashboardCard
        title={cardTitle}
        firstElement={timeZoneSelect}
        secondElement={() => EmptySchedulePopover(playerSchedules)}
        parentClassName="flex-auto max-w-135"
        childrenClassName="min-h-48"
      >
        {isLoading ? (
          <ScheduleTableSkeleton />
        ) : (
          <TeamScheduleTable
            team={player?.team}
            timeZoneId={selectedTimeZoneId}
          />
        )}
      </DashboardCard>
    )
  );
}
