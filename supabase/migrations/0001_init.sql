-- BondProof initial schema (spec §6)
-- Run once in the Supabase SQL Editor (or via `supabase db push` once the CLI is linked).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users: profile row mirroring auth.users, auto-created on signup.
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- checklist_items: seed data for the NSW room-by-room checklist (spec §4).
-- ---------------------------------------------------------------------------
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'NSW',
  room text not null,
  label text not null,
  guidance text,
  high_claim_flag boolean not null default false,
  min_photos int not null default 1
);

-- ---------------------------------------------------------------------------
-- rules: versioned NSW rules engine config (spec §5).
-- ---------------------------------------------------------------------------
create table public.rules (
  id uuid primary key default gen_random_uuid(),
  state text not null default 'NSW',
  key text not null,
  value_json jsonb not null,
  citation text,
  version int not null default 1,
  effective_from date not null default current_date
);

-- ---------------------------------------------------------------------------
-- tenancies
-- ---------------------------------------------------------------------------
create type tenancy_status as enum ('active', 'exiting', 'dispute', 'closed');

create table public.tenancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  address text not null,
  state text not null default 'NSW',
  lease_start date,
  lease_end date,
  agent_name text,
  agent_email text,
  bond_amount_cents int,
  rbo_number text,
  status tenancy_status not null default 'active',
  created_at timestamptz not null default now()
);

-- Enforce "one active tenancy per free account": at most one non-closed
-- tenancy per user at a time.
create unique index one_open_tenancy_per_user
  on public.tenancies (user_id)
  where status <> 'closed';

-- ---------------------------------------------------------------------------
-- capture_sessions
-- ---------------------------------------------------------------------------
create type capture_session_type as enum ('entry', 'exit', 'incident');

create table public.capture_sessions (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  type capture_session_type not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- evidence_items
-- ---------------------------------------------------------------------------
create type condition_rating as enum ('good', 'fair', 'damaged');

create table public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.capture_sessions (id) on delete cascade,
  checklist_item_id uuid not null references public.checklist_items (id),
  condition_rating condition_rating,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- photos: original + web-optimised derivative, never stripped of EXIF.
-- ---------------------------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  evidence_item_id uuid not null references public.evidence_items (id) on delete cascade,
  storage_key text not null,
  sha256 text not null,
  exif_taken_at timestamptz,
  exif_gps_lat double precision,
  exif_gps_lng double precision,
  uploaded_at timestamptz not null default now(),
  bytes bigint
);

-- ---------------------------------------------------------------------------
-- disputes
-- ---------------------------------------------------------------------------
create type dispute_status as enum ('open', 'resolved', 'withdrawn');

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  opened_at timestamptz not null default now(),
  status dispute_status not null default 'open'
);

-- ---------------------------------------------------------------------------
-- claim_line_items
-- ---------------------------------------------------------------------------
create table public.claim_line_items (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.disputes (id) on delete cascade,
  category text not null,
  description text,
  amount_cents int not null,
  disputed boolean not null default true,
  our_position_text text
);

-- ---------------------------------------------------------------------------
-- deadlines
-- ---------------------------------------------------------------------------
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  kind text not null,
  due_at timestamptz not null,
  source_rule_id uuid references public.rules (id),
  notified_at timestamptz
);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create type document_type as enum (
  'entry_report',
  'exit_report',
  'evidence_pack',
  'response_letter',
  'ncat_form'
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references public.tenancies (id) on delete cascade,
  type document_type not null,
  storage_key text not null,
  generated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tenancy_id uuid references public.tenancies (id) on delete set null,
  stripe_payment_intent text not null,
  product text not null,
  amount_cents int not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: every user can only ever see their own data, reached
-- through tenancy ownership. checklist_items and rules are shared seed data
-- (world-readable, no user data), so RLS is enabled but with an open select
-- policy and no insert/update/delete policy for regular users.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.tenancies enable row level security;
alter table public.capture_sessions enable row level security;
alter table public.evidence_items enable row level security;
alter table public.photos enable row level security;
alter table public.disputes enable row level security;
alter table public.claim_line_items enable row level security;
alter table public.deadlines enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.checklist_items enable row level security;
alter table public.rules enable row level security;

create policy "users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "users can manage own tenancies"
  on public.tenancies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can manage own capture_sessions"
  on public.capture_sessions for all
  using (
    exists (
      select 1 from public.tenancies t
      where t.id = capture_sessions.tenancy_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tenancies t
      where t.id = capture_sessions.tenancy_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own evidence_items"
  on public.evidence_items for all
  using (
    exists (
      select 1 from public.capture_sessions cs
      join public.tenancies t on t.id = cs.tenancy_id
      where cs.id = evidence_items.session_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.capture_sessions cs
      join public.tenancies t on t.id = cs.tenancy_id
      where cs.id = evidence_items.session_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own photos"
  on public.photos for all
  using (
    exists (
      select 1 from public.evidence_items ei
      join public.capture_sessions cs on cs.id = ei.session_id
      join public.tenancies t on t.id = cs.tenancy_id
      where ei.id = photos.evidence_item_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.evidence_items ei
      join public.capture_sessions cs on cs.id = ei.session_id
      join public.tenancies t on t.id = cs.tenancy_id
      where ei.id = photos.evidence_item_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own disputes"
  on public.disputes for all
  using (
    exists (
      select 1 from public.tenancies t
      where t.id = disputes.tenancy_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tenancies t
      where t.id = disputes.tenancy_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own claim_line_items"
  on public.claim_line_items for all
  using (
    exists (
      select 1 from public.disputes d
      join public.tenancies t on t.id = d.tenancy_id
      where d.id = claim_line_items.dispute_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.disputes d
      join public.tenancies t on t.id = d.tenancy_id
      where d.id = claim_line_items.dispute_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own deadlines"
  on public.deadlines for all
  using (
    exists (
      select 1 from public.tenancies t
      where t.id = deadlines.tenancy_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tenancies t
      where t.id = deadlines.tenancy_id and t.user_id = auth.uid()
    )
  );

create policy "users can manage own documents"
  on public.documents for all
  using (
    exists (
      select 1 from public.tenancies t
      where t.id = documents.tenancy_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tenancies t
      where t.id = documents.tenancy_id and t.user_id = auth.uid()
    )
  );

create policy "users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "checklist_items are readable by any signed-in user"
  on public.checklist_items for select
  to authenticated
  using (true);

create policy "rules are readable by any signed-in user"
  on public.rules for select
  to authenticated
  using (true);
