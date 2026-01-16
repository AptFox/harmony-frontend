'use client';

import DashboardCard from '@/components/dashboard/dashboardCard';
import React, { useEffect, useState } from 'react';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeams } from '@/hooks/useTeams';
import EmptySchedulePopover from '@/components/dashboard/emptySchedulePopover';

export default function FranchiseScheduleTable({
  orgId,
}: {
  orgId: string | undefined;
}) {
  const { player } = usePlayer(orgId);
  const { franchiseTeams } = useTeams(player?.team?.franchise.id);
  const [selectedTeam, setSelectedTeam] = useState(
    franchiseTeams ? franchiseTeams[0] : undefined
  );
  const onSelectedTeamChange = (teamId: string) => {
    const team = franchiseTeams?.find((team) => team.id === teamId);
    setSelectedTeam(team);
  };

  const {
    teamSchedule: selectedTeamSchedule,
    isLoading: isLoadingTeamSchedule,
  } = useTeamSchedule(selectedTeam?.id);
  const playerSchedules = selectedTeamSchedule?.playerSchedules;
  const playersWithEmptySchedule = playerSchedules
    ?.filter(
      (schedule) => schedule.availability.weeklyAvailabilitySlots.length === 0
    )
    .map((player) => player.playerName);

  

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

  return (
    orgId && (
      <DashboardCard
        title={cardTitle}
        secondaryButton={() => EmptySchedulePopover(playersWithEmptySchedule)}
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
                <Skeleton />
              ) : (
                <TeamScheduleTable team={selectedTeam} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </DashboardCard>
    )
  );
}
