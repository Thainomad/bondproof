-- Adds a stable text slug to checklist_items so the seed script can upsert
-- idempotently without depending on the generated uuid.
alter table public.checklist_items add column slug text;
update public.checklist_items set slug = id::text where slug is null;
alter table public.checklist_items alter column slug set not null;
create unique index checklist_items_slug_key on public.checklist_items (slug);
