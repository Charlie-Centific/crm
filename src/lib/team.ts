export interface TeamMember {
  name: string;
  initials: string;
  color: string;
}

// Static list matches DB — used for filters and color lookup without a DB query
export const TEAM: TeamMember[] = [
  { name: "Charlie Gonzalez",  initials: "CG", color: "blue" },
  { name: "Cynthia Colbert",   initials: "CC", color: "purple" },
  { name: "Michael Underwood", initials: "MU", color: "green" },
  { name: "Jordan Ripoll",     initials: "JR", color: "orange" },
];

export const TEAM_BY_NAME = Object.fromEntries(TEAM.map((m) => [m.name, m]));

export const AVATAR_COLORS: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700 ring-blue-200",
  purple: "bg-purple-100 text-purple-700 ring-purple-200",
  green:  "bg-green-100 text-green-700 ring-green-200",
  orange: "bg-orange-100 text-orange-700 ring-orange-200",
  gray:   "bg-gray-100 text-gray-600 ring-gray-200",
};

export function getMember(name: string | null | undefined): TeamMember | null {
  if (!name) return null;
  return TEAM_BY_NAME[name] ?? null;
}
