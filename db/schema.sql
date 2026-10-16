-- Alok Plastics: Neon Postgres schema. Idempotent: run with `pnpm db:migrate`.
-- Timestamps are unix seconds (bigint), matching the PHP panel this replaces.

create table if not exists enquiries (
  id bigserial primary key,
  created_at bigint not null,
  updated_at bigint not null default 0,
  name text not null default '',
  company text not null default '',
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  state text not null default '',
  gstin text not null default '',
  buyer_type text not null default 'other',
  product text not null default '',
  products jsonb not null default '[]',
  quantity integer not null default 0,
  unit text not null default 'pcs',
  message text not null default '',
  source text not null default '',
  ip_hash text not null default '',
  mail_ok integer not null default 0,
  status text not null default 'new',
  notes jsonb not null default '[]',
  assigned_to text not null default '',
  seen integer not null default 0,
  archived integer not null default 0
);
create index if not exists idx_enq_created on enquiries(created_at);
create index if not exists idx_enq_status on enquiries(status);

-- customers, orders, carts, sessions, applications, otp: small JSON documents keyed by collection.
create table if not exists docs (
  id bigserial primary key,
  collection text not null,
  data jsonb not null default '{}',
  created_at bigint not null,
  updated_at bigint not null
);
create index if not exists idx_docs_collection on docs(collection, id);
create index if not exists idx_docs_phone on docs((data->>'phone')) where collection in ('customers', 'otp');
create index if not exists idx_docs_hash on docs((data->>'hash')) where collection = 'sessions';

create table if not exists rate_limits (
  key text not null,
  hit_at bigint not null
);
create index if not exists idx_rate_key on rate_limits(key, hit_at);

-- counters and site-wide settings (careers, product overrides, settings...)
create table if not exists kv (
  key text primary key,
  value jsonb not null
);
