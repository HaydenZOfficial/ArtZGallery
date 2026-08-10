alter table public.artworks
  add column if not exists music_path text;

comment on column public.artworks.music_path is
  'Optional path to an audio file in the public artworks storage bucket.';
