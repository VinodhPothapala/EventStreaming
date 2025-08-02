// types/database.ts

export type Tier = 'free' | 'silver' | 'gold' | 'platinum';

/* events table types */
export interface EventsRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  image_url: string | null;
  tier: Tier;
}
export interface EventsInsert {
  title: string;
  description?: string | null;
  event_date: string;
  image_url?: string | null;
  tier: Tier;
}
export type EventsUpdate = Partial<EventsInsert>;

/* user_tiers table types */
export interface UserTiersRow {
  clerk_id: string;
  tier: Tier;
  updated_at: string;
}
export interface UserTiersInsert {
  clerk_id: string;
  tier: Tier;
}
export type UserTiersUpdate = Partial<UserTiersInsert>;

export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventsRow;
        Insert: EventsInsert;
        Update: EventsUpdate;
      };
      user_tiers: {
        Row: UserTiersRow;
        Insert: UserTiersInsert;
        Update: UserTiersUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      tier: Tier;
    };
  };
};
