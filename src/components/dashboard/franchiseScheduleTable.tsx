'use client';

import DashboardCard from '@/components/dashboard/dashboardCard';
import React, { useEffect, useState } from 'react';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeams } from '@/hooks/useTeams';
import EmptySchedulePopover from '@/components/dashboard/emptySchedulePopover';
import { getCurrentTimeZoneId, getTimeZones } from '@/lib/scheduleUtils';
import { TimeZone } from '@/types/ScheduleTypes';
import TimeZoneSelect from '@/components/dashboard/timeZoneSelect';
import ScheduleTableSkeleton from '@/components/dashboard/scheduleTableSkeleton';

export default function FranchiseScheduleTable({
  orgId,
  orgTimeZoneId,
}: {
  orgId: string | undefined;
  orgTimeZoneId: string | undefined;
}) {
  const { player } = usePlayer(orgId);
  const { franchiseTeams } = useTeams(player?.team?.franchise.id);
  const [selectedTeam, setSelectedTeam] = useState(
    franchiseTeams ? franchiseTeams[0] : undefined
  );
  const [selectedTimeZoneId, setSelectedTimeZoneId] = useState(
    getCurrentTimeZoneId()
  );
  const timeZones: TimeZone[] = getTimeZones(orgTimeZoneId);
  const onSelectedTeamChange = (teamId: string) => {
    const team = franchiseTeams?.find((team) => team.id === teamId);
    setSelectedTeam(team);
  };

  const {
    teamSchedule: selectedTeamSchedule,
    isLoading: isLoadingTeamSchedule,
  } = useTeamSchedule(selectedTeam?.id);

  const cardTitle = selectedTeam
    ? `${selectedTeam.franchise.name}`
    : 'Franchise Schedule';

  useEffect(() => {
    if (franchiseTeams && franchiseTeams.length > 0 && !selectedTeam) {
      setSelectedTeam(franchiseTeams[0]);
    }
  }, [franchiseTeams, selectedTeam]);

  const franchiseTeamsOmittingCurrentPlayerTeam = franchiseTeams?.filter(
    (team) => team.id !== player?.team?.id
  );

  const playerSchedules = selectedTeamSchedule?.playerSchedules;
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
    franchiseTeamsOmittingCurrentPlayerTeam && (
      <DashboardCard
        title={cardTitle}
        firstElement={timeZoneSelect}
        secondElement={() => EmptySchedulePopover(playerSchedules)}
        parentClassName="flex-auto max-w-135"
        childrenClassName="min-h-48"
      >
        {franchiseTeamsOmittingCurrentPlayerTeam && (
          <Tabs
            className="flex-auto w-full"
            value={selectedTeam?.id}
            onValueChange={onSelectedTeamChange}
          >
            <div className="flex flex-col gap-1">
              <TabsList
                className={`${franchiseTeamsOmittingCurrentPlayerTeam.length > 1 ? `border` : ''}`}
              >
                {franchiseTeamsOmittingCurrentPlayerTeam.map((team) => (
                  <TabsTrigger className="grow" key={team.id} value={team.id}>
                    {team.skillGroup.acronym}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent
              className="relative overflow-auto mt-0.5"
              value={selectedTeam?.id || 'default'}
            >
              {isLoadingTeamSchedule ? (
                <ScheduleTableSkeleton />
              ) : (
                <TeamScheduleTable
                  team={selectedTeam}
                  timeZoneId={selectedTimeZoneId}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </DashboardCard>
    )
  );
}
