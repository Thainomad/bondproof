-- Support multiple concurrent stays per account (e.g. a long-term lease
-- plus a short-term Airbnb trip at the same time). Previously at most one
-- non-closed tenancy was allowed per user; the app now shows a switcher
-- instead of enforcing a single open tenancy.

drop index if exists public.one_open_tenancy_per_user;
