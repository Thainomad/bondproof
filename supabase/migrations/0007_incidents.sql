-- Support free-form incident logging (e.g. "mold appeared in month 3"),
-- separate from the structured entry/exit checklist walkthrough.
-- capture_sessions.type already includes 'incident' from the initial
-- schema; evidence_items just needs to allow a standalone entry not tied
-- to a predefined checklist item, with its own short title.

alter table public.evidence_items
  alter column checklist_item_id drop not null;

alter table public.evidence_items
  add column title text;
