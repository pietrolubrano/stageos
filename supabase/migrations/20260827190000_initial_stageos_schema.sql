create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'manager', 'viewer');
create type public.professional_kind as enum ('technician', 'musician', 'dancer', 'production', 'video', 'other');
create type public.slot_status as enum ('confirmed', 'pending', 'missing', 'declined');
create type public.invitation_channel as enum ('share_link', 'whatsapp_share', 'push', 'email');
create type public.invitation_status as enum ('draft', 'shared', 'opened', 'accepted', 'declined', 'expired');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  kind public.professional_kind not null default 'other',
  city text,
  notes text,
  source text not null default 'rubrica' check (source in ('rubrica', 'stageos', 'esterno')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.template_slots (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.production_templates(id) on delete cascade,
  department text not null,
  role text not null,
  default_fee integer not null default 0 check (default_fee >= 0),
  quantity integer not null default 1 check (quantity > 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.productions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid references public.production_templates(id) on delete set null,
  artist text not null,
  city text not null,
  venue text not null,
  production_date date not null,
  call_time time,
  soundcheck_time time,
  show_time time,
  manager_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_slots (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  department text not null,
  role text not null,
  status public.slot_status not null default 'missing',
  fee integer not null default 0 check (fee >= 0),
  source text not null default 'rubrica' check (source in ('rubrica', 'stageos', 'esterno')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  production_slot_id uuid not null references public.production_slots(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete set null,
  channel public.invitation_channel not null default 'share_link',
  status public.invitation_status not null default 'draft',
  message text not null,
  response_token uuid not null default gen_random_uuid(),
  shared_at timestamptz,
  opened_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (response_token)
);

create index production_slots_production_id_idx on public.production_slots (production_id);
create index professionals_organization_id_idx on public.professionals (organization_id);
create index productions_organization_date_idx on public.productions (organization_id, production_date);
create index invitations_slot_idx on public.invitations (production_slot_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger professionals_set_updated_at before update on public.professionals for each row execute function public.set_updated_at();
create trigger production_templates_set_updated_at before update on public.production_templates for each row execute function public.set_updated_at();
create trigger productions_set_updated_at before update on public.productions for each row execute function public.set_updated_at();
create trigger production_slots_set_updated_at before update on public.production_slots for each row execute function public.set_updated_at();
create trigger invitations_set_updated_at before update on public.invitations for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.professionals enable row level security;
alter table public.production_templates enable row level security;
alter table public.template_slots enable row level security;
alter table public.productions enable row level security;
alter table public.production_slots enable row level security;
alter table public.invitations enable row level security;

create policy "Users can read their profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their organizations"
  on public.organizations for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organizations.id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Users can read their memberships"
  on public.organization_members for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Managers can read professionals"
  on public.professionals for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = professionals.organization_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write professionals"
  on public.professionals for all
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = professionals.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = professionals.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );

create policy "Members can read templates"
  on public.production_templates for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = production_templates.organization_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write templates"
  on public.production_templates for all
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = production_templates.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = production_templates.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );

create policy "Members can read template slots"
  on public.template_slots for select
  to authenticated
  using (
    exists (
      select 1
      from public.production_templates pt
      join public.organization_members om on om.organization_id = pt.organization_id
      where pt.id = template_slots.template_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write template slots"
  on public.template_slots for all
  to authenticated
  using (
    exists (
      select 1
      from public.production_templates pt
      join public.organization_members om on om.organization_id = pt.organization_id
      where pt.id = template_slots.template_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.production_templates pt
      join public.organization_members om on om.organization_id = pt.organization_id
      where pt.id = template_slots.template_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );

create policy "Members can read productions"
  on public.productions for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = productions.organization_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write productions"
  on public.productions for all
  to authenticated
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = productions.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = productions.organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );

create policy "Members can read production slots"
  on public.production_slots for select
  to authenticated
  using (
    exists (
      select 1
      from public.productions p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = production_slots.production_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write production slots"
  on public.production_slots for all
  to authenticated
  using (
    exists (
      select 1
      from public.productions p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = production_slots.production_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.productions p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = production_slots.production_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );

create policy "Members can read invitations"
  on public.invitations for select
  to authenticated
  using (
    exists (
      select 1
      from public.production_slots ps
      join public.productions p on p.id = ps.production_id
      join public.organization_members om on om.organization_id = p.organization_id
      where ps.id = invitations.production_slot_id
      and om.user_id = (select auth.uid())
    )
  );

create policy "Managers can write invitations"
  on public.invitations for all
  to authenticated
  using (
    exists (
      select 1
      from public.production_slots ps
      join public.productions p on p.id = ps.production_id
      join public.organization_members om on om.organization_id = p.organization_id
      where ps.id = invitations.production_slot_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.production_slots ps
      join public.productions p on p.id = ps.production_id
      join public.organization_members om on om.organization_id = p.organization_id
      where ps.id = invitations.production_slot_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'manager')
    )
  );
