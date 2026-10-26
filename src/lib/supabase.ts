import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();

export const backendConfigured = Boolean(supabaseUrl && publishableKey);

export const supabase = backendConfigured
  ? createClient(supabaseUrl!, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export type Profile = {
  id: string;
  full_name: string;
  headline: string;
  bio: string;
  college: string;
  skills_teach: string[];
  skills_learn: string[];
  created_at: string;
  updated_at: string;
};

export type ExchangeRequest = {
  id: string;
  sender_id: string;
  recipient_id: string;
  teach_skill: string;
  learn_skill: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
