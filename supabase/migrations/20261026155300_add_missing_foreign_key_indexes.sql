-- Add indexes for foreign-key lookups used by messaging and saved-profile references.
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists saved_profiles_profile_id_idx on public.saved_profiles (profile_id);
