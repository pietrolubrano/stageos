-- Remote-safe demo data: public tables only (no auth.users).
-- Manager name falls back to "Production manager" until Auth is connected.

insert into public.organizations (id, name)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'StageOS Demo')
on conflict (id) do nothing;

insert into public.professionals (id, organization_id, full_name, phone, kind, city, source)
values
  ('30000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Pietro I.', '+39 333 000 0001', 'technician', 'Napoli', 'stageos'),
  ('30000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Marco Bifulco', '+39 333 000 0002', 'musician', 'Napoli', 'rubrica'),
  ('30000000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Marta Vitiello', '+39 333 000 0003', 'dancer', 'Salerno', 'stageos'),
  ('30000000-0000-4000-8000-000000000004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Sara Fusco', '+39 333 000 0004', 'dancer', 'Napoli', 'rubrica'),
  ('30000000-0000-4000-8000-000000000005', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Nadia Ferri', '+39 333 000 0005', 'technician', 'Napoli', 'stageos'),
  ('30000000-0000-4000-8000-000000000006', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Enzo Greco', '+39 333 000 0006', 'production', 'Napoli', 'rubrica'),
  ('30000000-0000-4000-8000-000000000007', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ciro Lanza', '+39 333 000 0007', 'video', 'Napoli', 'esterno'),
  ('30000000-0000-4000-8000-000000000008', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Lorenzo Pace', '+39 333 000 0008', 'technician', 'Salerno', 'rubrica')
on conflict (id) do nothing;

insert into public.production_templates (id, organization_id, name, description)
values
  ('40000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'SHOW VERONICA - FULL', 'Template completo per show teatrale'),
  ('40000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'ARENA - LIGHT', 'Template ridotto per arena')
on conflict (organization_id, name) do nothing;

insert into public.productions (id, organization_id, template_id, artist, city, venue, production_date, call_time, soundcheck_time, show_time)
values
  ('50000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '40000000-0000-4000-8000-000000000001', 'Veronica Simioli', 'Napoli', 'Teatro Mediterraneo', '2026-09-18', '15:00', '18:00', '21:30'),
  ('50000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '40000000-0000-4000-8000-000000000002', 'Produzione XYZ', 'Salerno', 'Arena del Mare', '2026-09-21', '14:30', '17:30', '22:00')
on conflict (id) do nothing;

insert into public.production_slots (id, production_id, professional_id, department, role, status, fee, source)
values
  ('60000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'Audio', 'FOH Engineer', 'confirmed', 250, 'stageos'),
  ('60000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'Musicisti', 'Basso', 'confirmed', 220, 'rubrica'),
  ('60000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'Ballerini', 'Dance captain', 'pending', 160, 'stageos'),
  ('60000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000001', null, 'Luci', 'Lighting operator', 'missing', 240, 'rubrica'),
  ('60000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000004', 'Ballerini', 'Ballerino', 'pending', 150, 'rubrica'),
  ('60000000-0000-4000-8000-000000000006', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000006', 'Produzione', 'Stage manager', 'pending', 210, 'rubrica'),
  ('60000000-0000-4000-8000-000000000007', '50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000007', 'Video', 'LED operator', 'declined', 200, 'esterno'),
  ('60000000-0000-4000-8000-000000000008', '50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'Audio', 'FOH Engineer', 'pending', 250, 'stageos'),
  ('60000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000008', 'Audio', 'PA Tech', 'confirmed', 190, 'rubrica'),
  ('60000000-0000-4000-8000-000000000010', '50000000-0000-4000-8000-000000000002', null, 'Produzione', 'Runner', 'missing', 120, 'rubrica')
on conflict (id) do nothing;

insert into public.invitations (id, production_slot_id, professional_id, channel, status, message, response_token, shared_at)
values (
  '70000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000003',
  'whatsapp_share',
  'shared',
  'Pietro ti invita a una nuova data:' || chr(10) || chr(10) || 'Veronica Simioli' || chr(10) || '18 settembre 2026 · Napoli' || chr(10) || 'Ruolo: Dance captain' || chr(10) || 'Call: 15:00' || chr(10) || 'Soundcheck: 18:00' || chr(10) || 'Show: 21:30' || chr(10) || 'Cachet: €160' || chr(10) || chr(10) || 'Rispondi qui: http://localhost:3000/i/11111111-aaaa-4bbb-8ccc-000000000001',
  '11111111-aaaa-4bbb-8ccc-000000000001',
  now()
)
on conflict (id) do nothing;
