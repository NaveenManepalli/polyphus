-- ===========================================================================
-- Polyphus waitlist — Supabase schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It creates the table, locks it down, and validates addresses on the server.
--
-- WHY THE SERVER VALIDATES TOO
-- The check in js/modules/signup.js is a courtesy to the person typing. It runs
-- in their browser, so anyone can bypass it with one line in a console. The
-- WITH CHECK clause below is the one that actually holds.
-- ===========================================================================

create table if not exists public.waitlist (
  id          bigint generated always as identity primary key,
  email       text        not null,
  source      text        not null default 'polyphus-waitlist',
  referrer    text,
  created_at  timestamptz not null default now(),

  -- Addresses are stored already lower-cased and trimmed. Enforcing it here
  -- rather than trusting the client is what lets the unique constraint below
  -- actually mean "one row per person" — otherwise Me@x.com and me@x.com are
  -- two different rows.
  constraint waitlist_email_normalised check (email = lower(btrim(email))),
  constraint waitlist_email_unique      unique (email)
);

comment on table  public.waitlist is 'Launch waitlist for polyphus_. One row per address.';
comment on column public.waitlist.source   is 'Which form/page the signup came from.';
comment on column public.waitlist.referrer is 'document.referrer at signup, for attribution. Nullable.';

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The anon key is PUBLIC — it ships inside start.html and anyone can read it
-- out of the page source. That is how Supabase is designed to work, and it is
-- safe ONLY because of the policies below:
--
--   * anon may INSERT, and only rows that pass the address check.
--   * anon has NO select / update / delete policy, so the key cannot be used
--     to read your list, change it, or empty it.
--
-- If you ever disable RLS on this table, that public key immediately becomes a
-- way for anyone to download every address you have collected.
-- ---------------------------------------------------------------------------

alter table public.waitlist enable row level security;

drop policy if exists "anon may join the waitlist" on public.waitlist;

create policy "anon may join the waitlist"
  on public.waitlist
  for insert
  to anon
  with check (
        email = lower(btrim(email))
    and length(email) between 6 and 254
    -- deliberately permissive on the domain: every provider and TLD is fine.
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
    and source is not null
    and length(source) <= 64
    and (referrer is null or length(referrer) <= 512)
  );

-- ---------------------------------------------------------------------------
-- Privileges — defence in depth, on top of RLS
--
-- Supabase does NOT start you from zero here. Its default privileges already
-- grant anon and authenticated full table rights in the public schema, so a
-- fresh table is protected by RLS *alone*. That is one mistake away from a
-- leak: turn RLS off for a minute to debug something and the public key in
-- your page can read, edit and empty the table.
--
-- So take those rights away explicitly and hand back only INSERT. Now the key
-- is limited twice over, and disabling RLS is no longer catastrophic.
--
-- (Plain INSERT needs no SELECT privilege. `INSERT ... ON CONFLICT` does,
--  which is the other reason this schema dedupes via the unique constraint
--  and a 409 instead — see js/modules/signup.js.)
-- ---------------------------------------------------------------------------

revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon;

-- Reading the list is for you, not for the site. Use the dashboard, or the
-- service_role key from a trusted server — never from the browser.

-- ---------------------------------------------------------------------------
-- Export, when you are ready to send the launch email:
--
--   select email, created_at
--     from public.waitlist
--    order by created_at;
--
-- Dashboard → Table Editor → waitlist → Export → CSV does the same thing.
-- ---------------------------------------------------------------------------
