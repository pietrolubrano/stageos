insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'manager@stageos.local', crypt('stageos-demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'foh@stageos.local', crypt('stageos-demo', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, full_name, phone)
values
  ('11111111-1111-4111-8111-111111111111', 'Pietro Manager', '+39 333 000 0000'),
  ('22222222-2222-4222-8222-222222222222', 'Pietro I.', '+39 333 000 0001')
on conflict (id) do nothing;

insert into public.organizations (id, name)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'StageOS Demo')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner')
on conflict do nothing;

insert into public.professionals (id, organization_id, profile_id, full_name, phone, kind, city, source)
values
  ('30000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'Pietro I.', '+39 333 000 0001', 'technician', 'Napoli', 'stageos'),
  ('30000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', null, 'Marco Bifulco', '+39 333 000 0002', 'musician', 'Napoli', 'rubrica'),
  ('30000000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', null, 'Marta Vitiello', '+39 333 000 0003', 'dancer', 'Salerno', 'stageos')
on conflict (id) do nothing;

insert into public.production_templates (id, organization_id, name, description)
values ('40000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'SHOW VERONICA - FULL', 'Template completo per show teatrale')
on conflict (organization_id, name) do nothing;

insert into public.productions (id, organization_id, template_id, artist, city, venue, production_date, call_time, soundcheck_time, show_time, manager_user_id)
values ('50000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '40000000-0000-4000-8000-000000000001', 'Veronica Simioli', 'Napoli', 'Teatro Mediterraneo', '2026-09-18', '15:00', '18:00', '21:30', '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into public.production_slots (id, production_id, professional_id, department, role, status, fee, source)
values
  ('60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Audio', 'FOH Engineer', 'confirmed', 250, 'stageos'),
  ('60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'Musicisti', 'Basso', 'confirmed', 220, 'rubrica'),
  ('60000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'Ballerini', 'Dance captain', 'pending', 160, 'stageos'),
  ('60000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000001', null, 'Luci', 'Lighting operator', 'missing', 240, 'rubrica')
on conflict (id) do nothing;

insert into public.invitations (id, production_slot_id, professional_id, channel, status, message, shared_at)
values ('70000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'whatsapp_share', 'shared', 'Pietro ti invita a una nuova data: 18 settembre, Napoli. Ruolo Dance captain. Apri il link per accettare o rifiutare.', now())
on conflict (id) do nothing;
