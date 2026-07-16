export interface Profile {
  id: string;
  display_name: string;
  favorite_team: string;
  bio: string;
  avatar_emoji: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  team_tag: string;
  content: string;
  created_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface GameRoom {
  id: string;
  host_id: string;
  title: string;
  team_home: string;
  team_away: string;
  kickoff_at: string;
  created_at: string;
}

export interface GameRoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface PostWithDetails extends Post {
  author: Profile | null;
  reactions: PostReaction[];
  comments: (PostComment & { author: Profile | null })[];
}
