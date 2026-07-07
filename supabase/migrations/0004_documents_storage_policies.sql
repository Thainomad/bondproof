-- Storage RLS for the `documents` bucket. Objects are stored at
-- `${user_id}/${document_id}.pdf`, so ownership is checked by matching the
-- first path segment to auth.uid(), same pattern as the `photos` bucket.

create policy "users can read own documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can upload own documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
