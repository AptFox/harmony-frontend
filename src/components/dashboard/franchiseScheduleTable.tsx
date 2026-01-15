'use client';

import DashboardCard from '@/components/dashboard/dashboardCard';
import React, { useEffect, useState } from 'react';
import { useTeamSchedule } from '@/hooks/useTeamSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import TeamScheduleTable from '@/components/dashboard/teamScheduleTable';
import { usePlayer } from '@/hooks/usePlayer';
import { useTeams } from '@/hooks/useTeams';

export default function FranchiseScheduleTable({
  orgId
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

  const cardTitle = selectedTeam
    ? `${selectedTeam.franchise.name}`
    : 'Franchise Schedule';

  useEffect(() => {
    if (franchiseTeams && franchiseTeams.length > 0 && !selectedTeam){
      setSelectedTeam(franchiseTeams[0]);
    }
  }, [franchiseTeams, selectedTeam])

  const franchiseTeamsOmittingCurrentPlayerTeam = franchiseTeams?.filter((team) => team.id !== player?.team?.id)
  
  return (
    orgId && (
      <DashboardCard
        title={cardTitle}
        secondaryButton={playersWithNoAvailabilityPopOver}
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
              <TabsList className={`${franchiseTeamsOmittingCurrentPlayerTeam.length > 1 ? `border` : ''}`}>
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
