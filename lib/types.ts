export interface Profile {
  id: string;
  display_name: string;
  city: string;
  bio: string;
  updated_at: string;
}

export interface GameTable {
  id: string;
  host_id: string;
  game: string;
  session_date: string;
  session_time: string;
  location: string;
  max_players: number;
  experience: string;
  notes: string;
  created_at: string;
}

export interface TablePlayer {
  id: string;
  table_id: string;
  user_id: string;
  joined_at: string;
}

export interface LibraryGame {
  id: string;
  user_id: string;
  game_name: string;
  created_at: string;
}

export interface TableWithPlayers extends GameTable {
  players: (TablePlayer & { profile: Profile | null })[];
  hostProfile: Profile | null;
}
