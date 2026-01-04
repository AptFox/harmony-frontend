import { usePlayer } from '@/contexts/PlayerContext';
import { Organization, Player } from '@/types/PlayerTypes';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardCard from '@/components/dashboard/dashboardCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@radix-ui/react-separator';
import { useState } from 'react';

export default function PlayerCard() {
  const { players, isLoading } = usePlayer();
  const orgs: Organization[] = players
    ? players
        .map((p) => p.organization)
        .filter((org): org is Organization => !!org)
    : [];
  const firstOrgId = orgs.length > 0 ? orgs[0].id : undefined;
  const [selectedOrgId, setSelectedOrgId] = useState(
    firstOrgId ? firstOrgId : null
  );
  const selectedPlayer: Player | undefined =
    players && selectedOrgId ?
    players?.find((player) => player.organization.id === selectedOrgId) : undefined;

  return (
    <DashboardCard
      title="Player details"
      parentClassName="flex-auto max-w-[543px]"
      childrenClassName="max-h-96 min-h-54"
    >
      {isLoading ? (
        <Skeleton />
      ) : (
        <Tabs
          className="flex-auto"
          value={selectedOrgId || undefined}
          onValueChange={setSelectedOrgId}
        >
          <TabsList>
            {orgs.map((org) => (
              <TabsTrigger key={org.id} value={org.id}>
                {org.acronym}
              </TabsTrigger>
            ))}
          </TabsList>
          <Separator />
          <TabsContent value={selectedOrgId || 'default'}>
            <div>
              {selectedPlayer && (
                <div>
                  {selectedPlayer?.team && (
                    <p className="text-sm">
                      Org: {selectedPlayer.team?.organization.name}
                    </p>
                  )}
                  {selectedPlayer?.team && (
                    <p className="text-sm">Team: {selectedPlayer.team.name}</p>
                  )}
                  <p className="text-sm">Player name: {selectedPlayer.name}</p>
                  <p className="text-sm">
                    Team role:{' '}
                    {selectedPlayer.teamRole
                      ? selectedPlayer.teamRole
                      : 'player'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DashboardCard>
  );
}
