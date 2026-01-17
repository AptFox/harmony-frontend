export type Organization = {
  id: string;
  name: string;
  acronym: string;
  timeZoneId: string;
};

export type SkillGroup = {
  id: string;
  name: string;
  acronym: string;
  imageUrl: string;
  colorHex: string | undefined;
};

export type Franchise = {
  id: string;
  name: string;
  acronym: string;
  imageUrl: string;
};

export type Team = {
  id: string;
  skillGroup: SkillGroup;
  franchise: Franchise;
  name: string;
};

export type Player = {
  id: string;
  name: string;
  organization: Organization;
  team: Team | undefined;
  userId: string;
  teamRole: string | undefined;
};

export type PlayerContextType = {
  player: Player | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};

export type OrgContextType = {
  orgs: Organization[] | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};

export type TeamsContextType = {
  franchiseTeams: Team[] | undefined;
  isLoading: boolean;
  isError: Error | undefined;
};
