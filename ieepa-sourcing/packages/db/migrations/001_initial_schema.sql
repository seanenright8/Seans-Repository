-- ============================================================
-- IEEPA Trade Claim Sourcing System — Initial Schema
-- Run against your Supabase project via the SQL editor or CLI
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for full-text contact search

-- ── Enums ────────────────────────────────────────────────────

create type claim_status as enum (
  'new',
  'reviewing',
  'quoted',
  'negotiating',
  'closed_won',
  'closed_lost'
);

create type outreach_status as enum (
  'scheduled',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'replied'
);

create type monitor_source as enum (
  'federal_register',
  'cit_cases',
  'news',
  'sec_edgar'
);

-- ── Table: contacts ──────────────────────────────────────────
-- Deduplicated record per company+person combination.
-- A single contact may be linked to multiple claims.

create table contacts (
  id               uuid primary key default uuid_generate_v4(),
  company_name     text not null,
  contact_name     text,
  email            text,
  phone            text,
  title            text,                    -- CFO, VP Supply Chain, etc.
  source           text,                    -- 'web_form' | 'outreach' | 'referral' | 'manual'
  referral_source  text,                    -- who referred them
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  enriched_at      timestamptz,             -- when Apollo enrichment ran
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint contacts_email_unique unique (email)
);

create index contacts_company_name_idx on contacts using gin (company_name gin_trgm_ops);
create index contacts_email_idx on contacts (email);

-- ── Table: claims ────────────────────────────────────────────

create table claims (
  id                    uuid primary key default uuid_generate_v4(),
  contact_id            uuid references contacts (id) on delete set null,

  -- Status tracking
  status                claim_status not null default 'new',
  assigned_to           text,                -- email of deal team member

  -- Step 1: Company info
  company_name          text not null,
  contact_name          text not null,
  email                 text not null,
  phone                 text,
  role                  text,

  -- Step 2: Claim details
  total_tariff_amount   numeric(18, 2),      -- USD
  payment_date_start    date,
  payment_date_end      date,
  hts_codes             text[],              -- array of HTS codes
  ports_of_entry        text[],
  entries_count         integer,
  country_of_origin     text,
  nda_agreed            boolean not null default false,

  -- Step 3: Documentation
  file_paths            text[],              -- Supabase Storage paths
  storage_bucket        text default 'claim-documents',

  -- Internal
  internal_notes        text,
  activity_log          jsonb not null default '[]'::jsonb,

  -- Attribution
  referral_source       text,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index claims_status_idx on claims (status);
create index claims_contact_id_idx on claims (contact_id);
create index claims_email_idx on claims (email);
create index claims_created_at_idx on claims (created_at desc);

-- ── Table: contact_messages ──────────────────────────────────
-- Submissions from the /about contact form.

create table contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  company     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index contact_messages_email_idx on contact_messages (email);

-- ── Table: email_templates ───────────────────────────────────
-- Reusable templates for outreach sequences. Seeded below.

create table email_templates (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  sequence_name  text not null,    -- 'sequence_a' | 'sequence_b' | 'sequence_c'
  email_number   integer not null, -- 1, 2, 3, 4 within the sequence
  subject        text not null,
  body_html      text not null,
  body_text      text not null,
  delay_days     integer not null default 0,  -- days after previous email
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint email_templates_sequence_email_unique unique (sequence_name, email_number)
);

-- ── Table: outreach_log ──────────────────────────────────────

create table outreach_log (
  id             uuid primary key default uuid_generate_v4(),
  contact_id     uuid references contacts (id) on delete cascade,
  claim_id       uuid references claims (id) on delete set null,
  template_id    uuid references email_templates (id) on delete set null,
  sequence_name  text not null,
  email_number   integer not null,
  to_email       text not null,
  subject        text not null,
  status         outreach_status not null default 'scheduled',
  provider_id    text,             -- Resend message ID for webhook matching
  sent_at        timestamptz,
  delivered_at   timestamptz,
  opened_at      timestamptz,
  clicked_at     timestamptz,
  replied_at     timestamptz,
  bounce_reason  text,
  created_at     timestamptz not null default now()
);

create index outreach_log_contact_id_idx on outreach_log (contact_id);
create index outreach_log_claim_id_idx on outreach_log (claim_id);
create index outreach_log_status_idx on outreach_log (status);
create index outreach_log_provider_id_idx on outreach_log (provider_id);
create index outreach_log_sent_at_idx on outreach_log (sent_at desc);

-- ── Table: monitor_alerts ────────────────────────────────────

create table monitor_alerts (
  id          uuid primary key default uuid_generate_v4(),
  source      monitor_source not null,
  title       text not null,
  summary     text,
  url         text,
  raw_data    jsonb,
  notified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index monitor_alerts_source_idx on monitor_alerts (source);
create index monitor_alerts_notified_idx on monitor_alerts (notified);
create index monitor_alerts_created_at_idx on monitor_alerts (created_at desc);

-- ── Row Level Security ────────────────────────────────────────
-- All tables are private. Service role key bypasses RLS.
-- Authenticated admin users (set via Supabase Auth custom claims) get full access.
-- Anonymous users: no read/write access via the anon key.

alter table contacts          enable row level security;
alter table claims            enable row level security;
alter table contact_messages  enable row level security;
alter table email_templates   enable row level security;
alter table outreach_log      enable row level security;
alter table monitor_alerts    enable row level security;

-- Admin role: full access (set custom claim "role"="admin" via Supabase Auth hook)
create policy "Admin full access: contacts"
  on contacts for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access: claims"
  on claims for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access: contact_messages"
  on contact_messages for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access: email_templates"
  on email_templates for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access: outreach_log"
  on outreach_log for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin full access: monitor_alerts"
  on monitor_alerts for all
  using  (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ── Triggers: updated_at ──────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on contacts
  for each row execute function set_updated_at();

create trigger claims_updated_at
  before update on claims
  for each row execute function set_updated_at();

create trigger email_templates_updated_at
  before update on email_templates
  for each row execute function set_updated_at();

-- ── Supabase Storage Bucket ───────────────────────────────────
-- Run via Supabase Dashboard > Storage, or via the management API.
-- Bucket: claim-documents (private, 50MB max per file)
-- The SQL below is reference only — storage buckets are created via API.
--
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values (
--   'claim-documents',
--   'claim-documents',
--   false,
--   52428800,  -- 50 MB
--   array[
--     'application/pdf',
--     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--     'text/csv',
--     'image/png',
--     'image/jpeg'
--   ]
-- );

-- ── Seed: Email Templates ─────────────────────────────────────
-- Sequence A: Cold Outreach to Importers (4 emails)
-- Sequence B: Warm Outreach to Intermediaries (3 emails)
-- Sequence C: Re-engagement for Stale Leads (3 emails)

insert into email_templates (name, sequence_name, email_number, subject, body_html, body_text, delay_days) values

-- ── Sequence A ─────────────────────────────────────────────
(
  'Sequence A — Email 1: Introduction',
  'sequence_a',
  1,
  'Your IEEPA tariff payments may be recoverable',
  '<p>Hi {{first_name}},</p>
<p>My name is {{sender_name}} and I work with an institutional fund that purchases IEEPA tariff claims from U.S. importers.</p>
<p>If {{company_name}} has paid duties under IEEPA authority — particularly the reciprocal tariffs imposed on goods from China, the EU, or other trade partners — you may be sitting on a transferable financial claim worth real money.</p>
<p>Rather than waiting years for a legal resolution (if one comes at all), many importers are choosing to sell these claims now for immediate cash. We assume the risk. You get paid today.</p>
<p>Would it make sense to have a quick conversation to see if your tariff payments qualify?</p>
<p>Best,<br>{{sender_name}}<br>{{sender_title}}<br>{{sender_company}}</p>
<p style="font-size:11px;color:#888;">This is not legal advice. Claim purchases are subject to due diligence and documentation review. All communications are held in strict confidence.</p>',
  'Hi {{first_name}},

My name is {{sender_name}} and I work with an institutional fund that purchases IEEPA tariff claims from U.S. importers.

If {{company_name}} has paid duties under IEEPA authority — particularly the reciprocal tariffs imposed on goods from China, the EU, or other trade partners — you may be sitting on a transferable financial claim worth real money.

Rather than waiting years for a legal resolution, many importers are choosing to sell these claims now for immediate cash. We assume the risk. You get paid today.

Would it make sense to have a quick conversation to see if your tariff payments qualify?

Best,
{{sender_name}}
{{sender_title}}
{{sender_company}}

---
This is not legal advice. All communications are held in strict confidence.',
  0
),
(
  'Sequence A — Email 2: Education',
  'sequence_a',
  2,
  'How importers are monetizing IEEPA tariff claims in 2025',
  '<p>Hi {{first_name}},</p>
<p>Following up on my note from earlier this week.</p>
<p>In case it''s helpful context: the legal basis for IEEPA tariff challenges is real and growing. Courts have already weighed in on the President''s authority under IEEPA, and active litigation in the Court of International Trade has created a secondary market for these claims.</p>
<p>We put together a short guide explaining the process: <a href="{{base_url}}/learn/how-to-sell-your-ieepa-trade-claim">How to Sell Your IEEPA Trade Claim</a>.</p>
<p>The short version: if your company paid tariffs under IEEPA, you may be able to assign that claim — and we buy those assignments for immediate liquidity.</p>
<p>Happy to answer any questions or run a quick estimate on what your payments might be worth.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

Following up on my note from earlier this week.

The legal basis for IEEPA tariff challenges is real and growing. Courts have already weighed in, and active litigation in the Court of International Trade has created a secondary market for these claims.

We put together a short guide: {{base_url}}/learn/how-to-sell-your-ieepa-trade-claim

The short version: if your company paid tariffs under IEEPA, you may be able to assign that claim — and we buy those assignments for immediate liquidity.

Happy to answer any questions.

Best,
{{sender_name}}',
  3
),
(
  'Sequence A — Email 3: Direct Ask',
  'sequence_a',
  3,
  'Quick question — 15 minutes?',
  '<p>Hi {{first_name}},</p>
<p>I''ll be direct: would 15 minutes make sense to walk through whether {{company_name}}''s IEEPA tariff payments qualify for our program?</p>
<p>No commitment. No legal advice. Just a quick look at your exposure and whether there''s a fit.</p>
<p>You can <a href="{{base_url}}/submit">submit your claim details here</a> for a preliminary estimate, or just reply and we can set up a call.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

Would 15 minutes make sense to walk through whether {{company_name}}''s IEEPA tariff payments qualify?

No commitment. Just a quick look at your exposure.

Submit details for a preliminary estimate: {{base_url}}/submit
Or just reply to set up a call.

Best,
{{sender_name}}',
  7
),
(
  'Sequence A — Email 4: Break-up',
  'sequence_a',
  4,
  'Closing the loop',
  '<p>Hi {{first_name}},</p>
<p>I don''t want to keep cluttering your inbox, so I''ll leave it here.</p>
<p>If the timing isn''t right, no worries at all. The IEEPA landscape is moving quickly — if your situation changes, or if tariff payments become a bigger priority, feel free to reach out or <a href="{{base_url}}/submit">submit your claim details</a> whenever it makes sense.</p>
<p>Wishing {{company_name}} well,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

I don''t want to keep cluttering your inbox, so I''ll leave it here.

If timing isn''t right, no worries. If things change, feel free to reach out or submit at {{base_url}}/submit.

Wishing {{company_name}} well,
{{sender_name}}',
  14
),

-- ── Sequence B ─────────────────────────────────────────────
(
  'Sequence B — Email 1: Partnership Intro',
  'sequence_b',
  1,
  'Referral opportunity — IEEPA tariff claims',
  '<p>Hi {{first_name}},</p>
<p>I work with an institutional fund that buys IEEPA tariff claims from U.S. importers — and we''re looking for customs brokers, trade lawyers, and freight forwarders who work closely with affected importers.</p>
<p>If you have clients who have paid significant IEEPA duties and might benefit from immediate liquidity (rather than waiting on litigation), we''d love to explore a referral arrangement.</p>
<p>We pay referral fees for introductions that lead to a completed transaction — and the process is low-friction for you and your client.</p>
<p>Worth a quick conversation?</p>
<p>Best,<br>{{sender_name}}<br>{{sender_title}}</p>',
  'Hi {{first_name}},

I work with an institutional fund that buys IEEPA tariff claims from U.S. importers.

We''re looking for customs brokers, trade lawyers, and freight forwarders with importer clients who have significant IEEPA exposure.

We pay referral fees for introductions that lead to completed transactions.

Worth a quick conversation?

Best,
{{sender_name}}',
  0
),
(
  'Sequence B — Email 2: How It Works',
  'sequence_b',
  2,
  'How our referral program works (quick read)',
  '<p>Hi {{first_name}},</p>
<p>A bit more detail on what the referral process looks like:</p>
<ol>
<li>You introduce us to a client with IEEPA tariff exposure</li>
<li>We evaluate their claim — typically within 24–48 hours</li>
<li>If we proceed, we issue a term sheet; your client decides whether to transact</li>
<li>On closing, we pay a referral fee based on the transaction size</li>
</ol>
<p>Your client benefits from immediate cash, no more litigation uncertainty. You get compensated for the introduction. We get a claim to work.</p>
<p>We operate under NDA and treat all introductions with full confidentiality.</p>
<p>Any clients come to mind? Happy to jump on a quick call.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

How the referral process works:
1. You introduce us to a client with IEEPA tariff exposure
2. We evaluate their claim within 24-48 hours
3. If we proceed, we issue a term sheet
4. On closing, we pay a referral fee

We operate under NDA. Happy to jump on a call.

Best,
{{sender_name}}',
  4
),
(
  'Sequence B — Email 3: Direct Ask',
  'sequence_b',
  3,
  'Can we set up a 15-minute call?',
  '<p>Hi {{first_name}},</p>
<p>Last note — I''d love to get on a quick call to walk through the program and see if it''s a fit for any of your clients.</p>
<p>If you have 15 minutes this week or next, just reply and we''ll find a time.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

Last note — I''d love to get on a 15-minute call to walk through the program.

Just reply if you have time this week or next.

Best,
{{sender_name}}',
  10
),

-- ── Sequence C ─────────────────────────────────────────────
(
  'Sequence C — Email 1: Re-engagement',
  'sequence_c',
  1,
  'Checking back in — tariff landscape has shifted',
  '<p>Hi {{first_name}},</p>
<p>It''s been a while since we last spoke. I wanted to reach out because the IEEPA tariff landscape has shifted significantly since then — and claims that might have seemed uncertain are now more clearly monetizable.</p>
<p>Courts have issued rulings, the litigation picture has clarified, and we''ve completed several transactions with importers in your industry.</p>
<p>If there''s any renewed interest in discussing your tariff exposure, I''d welcome the conversation.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

It''s been a while. I wanted to reach out because the IEEPA landscape has shifted — claims that seemed uncertain are now more clearly monetizable.

Courts have issued rulings and the picture has clarified. We''ve completed several transactions.

If there''s renewed interest, I''d welcome the conversation.

Best,
{{sender_name}}',
  0
),
(
  'Sequence C — Email 2: New Content',
  'sequence_c',
  2,
  'New resource: IEEPA legal update',
  '<p>Hi {{first_name}},</p>
<p>In case it''s useful: we published a new piece on recent IEEPA developments — <a href="{{base_url}}/learn/legal-basis-for-ieepa-tariff-challenges">The Legal Basis for IEEPA Tariff Challenges</a>.</p>
<p>The short version: the legal arguments for challenging these tariffs have strengthened, and importers with documented payment histories are increasingly attractive to institutional buyers like us.</p>
<p>Still open to picking up our conversation if the timing is better now.</p>
<p>Best,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

New resource: {{base_url}}/learn/legal-basis-for-ieepa-tariff-challenges

Short version: legal arguments for IEEPA challenges have strengthened, and importers with documented payment histories are increasingly attractive to buyers.

Still open to picking up our conversation.

Best,
{{sender_name}}',
  5
),
(
  'Sequence C — Email 3: Final Follow-up',
  'sequence_c',
  3,
  'Final note',
  '<p>Hi {{first_name}},</p>
<p>I''ll leave it at this — if your situation changes or the timing becomes right, please don''t hesitate to reach out or <a href="{{base_url}}/submit">submit your claim details here</a> for a no-obligation preliminary estimate.</p>
<p>We move fast. A quote typically takes 24 hours, and we can close in as little as 5 business days if everything checks out.</p>
<p>Wishing you well,<br>{{sender_name}}</p>',
  'Hi {{first_name}},

If your situation changes, reach out or submit at {{base_url}}/submit.

We move fast: 24-hour quote, 5-day close.

Wishing you well,
{{sender_name}}',
  10
);
