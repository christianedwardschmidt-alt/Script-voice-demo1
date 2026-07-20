export interface Profile {
  id: string;
  display_name: string;
  skill_level: number;
  home_court: string;
  note: string;
  bio: string;
  updated_at: string;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Invite {
  id: string;
  sender_id: string;
  recipient_id: string;
  court: string;
  scheduled_at: string;
  message: string;
  status: InviteStatus;
  created_at: string;
}

export interface InviteWithProfiles extends Invite {
  sender: Profile | null;
  recipient: Profile | null;
}

export interface Coach {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  price_per_hour: number;
  is_featured: boolean;
  beginner_friendly: boolean;
  created_at: string;
}

export type CoachBookingStatus = 'requested' | 'confirmed' | 'cancelled';

export interface CoachBooking {
  id: string;
  user_id: string;
  coach_id: string;
  scheduled_at: string;
  status: CoachBookingStatus;
  created_at: string;
}
