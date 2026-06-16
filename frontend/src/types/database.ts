// Auto-generated style types for our public schema.
// You can regenerate with `supabase gen types typescript` once your project is live.

export type UserRole = "user" | "coach" | "admin";
export type BasketballLevel = "debutant" | "intermediaire" | "avance" | "aucun";
export type AgeGroup = "enfant" | "adolescent" | "adulte" | "senior";
export type BookingStatus = "en_attente" | "confirme" | "annule";
export type NotificationType =
  | "booking_created_user"
  | "booking_status_user"
  | "booking_created_admin"
  | "booking_status_admin";

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  basketball_level: BasketballLevel | null;
  age_group: AgeGroup | null;
  avatar_url: string | null;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
  sort_order: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachSocialLinks {
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
}

export interface CoachProfile {
  id: string;
  user_id: string | null;
  full_name: string;
  tagline: string | null;
  bio: string | null;
  photo_url: string | null;
  gallery: string[];
  location: string | null;
  specialties: string[];
  certifications: string[];
  experience_years: number | null;
  philosophy: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: CoachSocialLinks | null;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  day_of_week: number; // 0..6
  start_time: string; // HH:MM:SS
  end_time: string;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  slot_date: string; // YYYY-MM-DD
  slot_time: string; // HH:MM:SS
  status: BookingStatus;
  notes: string | null;
  price_snapshot: number;
  created_at: string;
  updated_at: string;
  // joined fields
  service?: Service;
  profile?: Profile;
}

export interface NotificationEmail {
  id: string;
  email: string;
  label: string | null;
  active: boolean;
  created_at: string;
}

export interface NotificationWhatsapp {
  id: string;
  phone_number: string;
  label: string | null;
  active: boolean;
  created_at: string;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  subject: string | null;
  body_email: string | null;
  body_whatsapp: string | null;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
}
