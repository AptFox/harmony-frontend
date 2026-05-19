import DashboardCard from '@/components/dashboard/dashboardCard';
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import TimeZoneSelect from '@/components/dashboard/timeZoneSelect';
import PlayerFilterPopover from '@/components/dashboard/playerFilterPopover';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { getCurrentTimeZoneId, getTimeZones } from '@/lib/availabilityUtils';
import { TimeZone } from '@/types/ScheduleTypes';
import { OrgProps } from '@/types/OrganizationTypes';
import { useState } from 'react';

export default function TeamScheduleCard(props: OrgProps) {
  const { orgId, orgTimeZoneId } = props;
  const { player } = usePlayer(orgId);
  const { teamSchedule, isLoading } = useTeamSchedule(player?.team?.id);
  const cardTitle = player?.team?.name ? `${player?.team?.name}` : 'My Team';
  const [selectedTimeZoneId, setSelectedTimeZoneId] = useState(
    getCurrentTimeZoneId()
  );
  const [filteredPlayers, setFilteredPlayers] = useState(
    teamSchedule?.playerSchedules.map((schedule) => schedule.playerName)
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
        firstElement={() =>
          PlayerFilterPopover(
            playerSchedules,
            filteredPlayers,
            setFilteredPlayers
          )
        }
        secondElement={timeZoneSelect}
        parentClassName="flex-auto max-w-135"
        childrenClassName="min-h-48"
      >
        {isLoading ? (
          <ScheduleTableSkeleton />
        ) : (
          <TeamScheduleTable
            team={player?.team}
            selectedTimeZoneId={selectedTimeZoneId}
            filteredPlayers={filteredPlayers}
          />
        )}
      </DashboardCard>
    )
  );
}
