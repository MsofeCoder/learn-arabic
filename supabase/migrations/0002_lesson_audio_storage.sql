-- LisanFlow — lesson audio storage
--
-- A public-read bucket for lecture recordings. Public read is deliberate: the
-- recordings are course content, not learner data, and a public URL lets the
-- browser stream with HTTP Range requests straight from the storage CDN.
--
-- There is no insert/update/delete policy for anon or authenticated users, so
-- only the service role (the upload script, run by an operator) can write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-audio',
  'lesson-audio',
  true,
  52428800, -- 50 MiB, the largest supplied recording is ~48.4 MiB
  array['audio/mpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
