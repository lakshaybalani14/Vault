// ============================================================
// Vault — Database Type Definitions
// Mirrors the Supabase PostgreSQL schema
// ============================================================

export type PostType = 'lost' | 'found';
export type PostStatus = 'open' | 'claimed' | 'resolved' | 'expired';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';
export type MeetupStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type NotificationType =
  | 'new_claim'
  | 'claim_approved'
  | 'claim_rejected'
  | 'meetup_proposed'
  | 'meetup_confirmed'
  | 'post_expiring'
  | 'new_rating'
  | 'system';
export type ReportReason = 'spam' | 'false_claim' | 'inappropriate' | 'already_resolved' | 'other';
export type ItemCategory =
  | 'Electronics'
  | 'ID Card'
  | 'Keys'
  | 'Bag'
  | 'Books'
  | 'Clothing'
  | 'Wallet'
  | 'Water Bottle'
  | 'Other';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  trust_score: number;
  strikes: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  type: PostType;
  title: string;
  description: string;
  category: ItemCategory;
  found_at: string;
  image_urls: string[];
  status: PostStatus;
  is_anonymous: boolean;
  view_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  poster_name?: string | null;
  poster_avatar?: string | null;
  poster_trust_score?: number;
}

export interface SecretQuestion {
  id: string;
  post_id: string;
  question: string;
  answer_hash: string;
}

export interface Claim {
  id: string;
  post_id: string;
  claimer_id: string;
  message: string | null;
  attempts: number;
  locked_until: string | null;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  claimer_name?: string;
  claimer_avatar?: string | null;
  claimer_trust_score?: number;
  claimer_created_at?: string;
  claimer_strikes?: number;
  resolved_count?: number;
  answer_correct?: boolean;
  post_title?: string;
  post_type?: PostType;
}

export interface Meetup {
  id: string;
  claim_id: string;
  proposed_by: string;
  proposed_location: string;
  proposed_time: string;
  status: MeetupStatus;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  meetup_id: string;
  rater_id: string;
  rated_id: string;
  score: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string | null;
  reviewed: boolean;
  created_at: string;
}
