-- GrooveSharp — schema inicial de backend (contas + bandas)
-- Princípio: repertório é da banda; prática é da pessoa (por usuário+música).

-- ---------- tipos ----------
create type public.band_role as enum ('admin', 'member');
create type public.rating as enum ('solid', 'ok', 'shaky');

-- ---------- tabelas ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.bands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.band_members (
  band_id uuid not null references public.bands (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.band_role not null default 'member',
  instruments text[] not null default '{}',
  share_practice boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (band_id, user_id)
);

create table public.band_invites (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands (id) on delete cascade,
  token text not null unique,
  role public.band_role not null default 'member',
  created_by uuid references auth.users (id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands (id) on delete cascade,
  title text not null,
  artist text not null default '',
  duration text not null default '0:00',
  key text,
  bpm int,
  tuning text,
  notes text,
  links jsonb not null default '[]',
  added_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands (id) on delete cascade,
  name text not null,
  show_date date,
  position int not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.setlist_songs (
  setlist_id uuid not null references public.setlists (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position int not null default 0,
  primary key (setlist_id, song_id)
);

create table public.practice_entries (
  user_id uuid not null references auth.users (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  rating public.rating not null,
  last_practiced_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create index songs_band_idx on public.songs (band_id);
create index setlists_band_idx on public.setlists (band_id);
create index setlist_songs_song_idx on public.setlist_songs (song_id);
create index band_members_user_idx on public.band_members (user_id);
create index practice_song_idx on public.practice_entries (song_id);

-- ---------- helpers (SECURITY DEFINER evita recursão de RLS) ----------
create or replace function public.is_band_member(_band uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.band_members m
    where m.band_id = _band and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_band_admin(_band uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.band_members m
    where m.band_id = _band and m.user_id = auth.uid() and m.role = 'admin'
  );
$$;

-- Posso ver a prática de _owner nesta música? (própria, ou de colega que compartilha)
create or replace function public.can_see_practice(_song uuid, _owner uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select
    _owner = auth.uid()
    or exists (
      select 1
      from public.songs s
      join public.band_members me on me.band_id = s.band_id and me.user_id = auth.uid()
      join public.band_members ow on ow.band_id = s.band_id and ow.user_id = _owner
      where s.id = _song and ow.share_practice = true
    );
$$;

-- ---------- triggers ----------
-- cria profile quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- quem cria a banda entra como admin
create or replace function public.add_creator_as_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.band_members (band_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end; $$;

create trigger bands_add_creator
after insert on public.bands
for each row execute function public.add_creator_as_admin();

-- só admin muda papéis
create or replace function public.guard_member_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_band_admin(new.band_id) then
    raise exception 'Apenas admin pode mudar papéis';
  end if;
  return new;
end; $$;

create trigger band_members_guard_role
before update on public.band_members
for each row execute function public.guard_member_role();

-- aceitar convite por token (entra na banda)
create or replace function public.accept_invite(_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  inv public.band_invites;
begin
  select * into inv from public.band_invites where token = _token;
  if inv.id is null then raise exception 'Convite inválido'; end if;
  if inv.expires_at is not null and inv.expires_at < now() then raise exception 'Convite expirado'; end if;
  insert into public.band_members (band_id, user_id, role)
  values (inv.band_id, auth.uid(), inv.role)
  on conflict (band_id, user_id) do nothing;
  return inv.band_id;
end; $$;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.bands enable row level security;
alter table public.band_members enable row level security;
alter table public.band_invites enable row level security;
alter table public.songs enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_songs enable row level security;
alter table public.practice_entries enable row level security;

-- profiles: leitura por autenticados; escrita só a própria
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid());

-- bands
create policy bands_select on public.bands for select to authenticated using (public.is_band_member(id));
create policy bands_insert on public.bands for insert to authenticated with check (created_by = auth.uid());
create policy bands_update on public.bands for update to authenticated using (public.is_band_admin(id));
create policy bands_delete on public.bands for delete to authenticated using (public.is_band_admin(id));

-- band_members
create policy members_select on public.band_members for select to authenticated using (public.is_band_member(band_id));
create policy members_insert on public.band_members for insert to authenticated with check (public.is_band_admin(band_id));
create policy members_update on public.band_members for update to authenticated
  using (public.is_band_admin(band_id) or user_id = auth.uid());
create policy members_delete on public.band_members for delete to authenticated
  using (public.is_band_admin(band_id) or user_id = auth.uid());

-- band_invites: só admin
create policy invites_select on public.band_invites for select to authenticated using (public.is_band_admin(band_id));
create policy invites_insert on public.band_invites for insert to authenticated with check (public.is_band_admin(band_id));
create policy invites_delete on public.band_invites for delete to authenticated using (public.is_band_admin(band_id));

-- songs: membros leem e editam
create policy songs_select on public.songs for select to authenticated using (public.is_band_member(band_id));
create policy songs_insert on public.songs for insert to authenticated with check (public.is_band_member(band_id));
create policy songs_update on public.songs for update to authenticated using (public.is_band_member(band_id));
create policy songs_delete on public.songs for delete to authenticated using (public.is_band_member(band_id));

-- setlists: membros leem e editam
create policy setlists_select on public.setlists for select to authenticated using (public.is_band_member(band_id));
create policy setlists_insert on public.setlists for insert to authenticated with check (public.is_band_member(band_id));
create policy setlists_update on public.setlists for update to authenticated using (public.is_band_member(band_id));
create policy setlists_delete on public.setlists for delete to authenticated using (public.is_band_member(band_id));

-- setlist_songs: acesso via banda do setlist
create policy setlist_songs_all on public.setlist_songs for all to authenticated
  using (exists (select 1 from public.setlists s where s.id = setlist_id and public.is_band_member(s.band_id)))
  with check (exists (select 1 from public.setlists s where s.id = setlist_id and public.is_band_member(s.band_id)));

-- practice_entries: leitura própria ou de colega que compartilha; escrita só a própria
create policy practice_select on public.practice_entries for select to authenticated
  using (public.can_see_practice(song_id, user_id));
create policy practice_insert on public.practice_entries for insert to authenticated with check (user_id = auth.uid());
create policy practice_update on public.practice_entries for update to authenticated using (user_id = auth.uid());
create policy practice_delete on public.practice_entries for delete to authenticated using (user_id = auth.uid());

-- ---------- realtime ----------
alter publication supabase_realtime add table public.songs;
alter publication supabase_realtime add table public.setlists;
alter publication supabase_realtime add table public.setlist_songs;
alter publication supabase_realtime add table public.band_members;
alter publication supabase_realtime add table public.practice_entries;
