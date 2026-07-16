export interface Team {
  id: string;
  name: string;
  league: 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'Soccer';
}

export const LEAGUE_EMOJI: Record<Team['league'], string> = {
  NFL: '🏈',
  NBA: '🏀',
  MLB: '⚾',
  NHL: '🏒',
  Soccer: '⚽',
};

export const TEAMS: Team[] = [
  { id: 'nfl-chiefs', name: 'Kansas City Chiefs', league: 'NFL' },
  { id: 'nfl-eagles', name: 'Philadelphia Eagles', league: 'NFL' },
  { id: 'nfl-cowboys', name: 'Dallas Cowboys', league: 'NFL' },
  { id: 'nfl-49ers', name: 'San Francisco 49ers', league: 'NFL' },
  { id: 'nfl-bills', name: 'Buffalo Bills', league: 'NFL' },
  { id: 'nfl-ravens', name: 'Baltimore Ravens', league: 'NFL' },
  { id: 'nfl-lions', name: 'Detroit Lions', league: 'NFL' },
  { id: 'nfl-packers', name: 'Green Bay Packers', league: 'NFL' },
  { id: 'nfl-steelers', name: 'Pittsburgh Steelers', league: 'NFL' },
  { id: 'nfl-patriots', name: 'New England Patriots', league: 'NFL' },
  { id: 'nba-celtics', name: 'Boston Celtics', league: 'NBA' },
  { id: 'nba-lakers', name: 'Los Angeles Lakers', league: 'NBA' },
  { id: 'nba-warriors', name: 'Golden State Warriors', league: 'NBA' },
  { id: 'nba-bucks', name: 'Milwaukee Bucks', league: 'NBA' },
  { id: 'nba-nuggets', name: 'Denver Nuggets', league: 'NBA' },
  { id: 'nba-knicks', name: 'New York Knicks', league: 'NBA' },
  { id: 'nba-suns', name: 'Phoenix Suns', league: 'NBA' },
  { id: 'nba-mavericks', name: 'Dallas Mavericks', league: 'NBA' },
  { id: 'mlb-yankees', name: 'New York Yankees', league: 'MLB' },
  { id: 'mlb-dodgers', name: 'Los Angeles Dodgers', league: 'MLB' },
  { id: 'mlb-redsox', name: 'Boston Red Sox', league: 'MLB' },
  { id: 'mlb-braves', name: 'Atlanta Braves', league: 'MLB' },
  { id: 'mlb-astros', name: 'Houston Astros', league: 'MLB' },
  { id: 'mlb-cubs', name: 'Chicago Cubs', league: 'MLB' },
  { id: 'nhl-bruins', name: 'Boston Bruins', league: 'NHL' },
  { id: 'nhl-rangers', name: 'New York Rangers', league: 'NHL' },
  { id: 'nhl-oilers', name: 'Edmonton Oilers', league: 'NHL' },
  { id: 'nhl-mapleleafs', name: 'Toronto Maple Leafs', league: 'NHL' },
  { id: 'nhl-avalanche', name: 'Colorado Avalanche', league: 'NHL' },
  { id: 'soccer-realmadrid', name: 'Real Madrid', league: 'Soccer' },
  { id: 'soccer-barcelona', name: 'FC Barcelona', league: 'Soccer' },
  { id: 'soccer-mancity', name: 'Manchester City', league: 'Soccer' },
  { id: 'soccer-liverpool', name: 'Liverpool', league: 'Soccer' },
  { id: 'soccer-arsenal', name: 'Arsenal', league: 'Soccer' },
  { id: 'soccer-bayern', name: 'Bayern Munich', league: 'Soccer' },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

export function teamLabel(teamId: string | null | undefined): string {
  if (!teamId) return '';
  const t = TEAMS_BY_ID[teamId];
  return t ? `${LEAGUE_EMOJI[t.league]} ${t.name}` : teamId;
}
