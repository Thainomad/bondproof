-- Support short-term stays (Airbnb/Booking.com) alongside NSW residential
-- tenancies. Short-term stays skip bond-specific fields, the NSW statutory
-- deadlines, and the NCAT application (not applicable outside residential
-- tenancy law), but share the same entry/exit capture, comparison, evidence
-- pack, and response letter flow.

alter table public.tenancies
  add column stay_type text not null default 'long_term'
  check (stay_type in ('long_term', 'short_term'));
