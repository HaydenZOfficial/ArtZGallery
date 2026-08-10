create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (
    length(trim(email)) between 5 and 254
    and lower(trim(email)) ~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'
  );

grant select on public.newsletter_subscribers to authenticated;
drop policy if exists "Admin can view newsletter subscribers" on public.newsletter_subscribers;
create policy "Admin can view newsletter subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (auth.uid() = '64388341-ee37-430f-a590-f99b96939fca'::uuid);
