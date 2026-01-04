export type Organization = {
  id: string;
  name: string;
  acronym: string;
};

export type SkillGroup = {
  id: string;
  organization: Organization;
  name: string;
  acronym: string;
  imageUrl: string;
  colorHex: string | undefined;
};

export type Team = {
  id: string;
  organization: Organization;
  skillGroup: SkillGroup;
  name: string;
  acronym: string;
  imageUrl: string;
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
  players: Player[] | undefined;
  teams: Team[]
  isLoading: boolean;
  isError: Error | undefined;
};
