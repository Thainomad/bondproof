-- Storage RLS for the `photos` bucket. Objects are stored at
-- `${user_id}/${evidence_item_id}/${photo_id}-original.<ext>` (and `-web.<ext>`),
-- so ownership is checked by matching the first path segment to auth.uid().

create policy "users can read own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
