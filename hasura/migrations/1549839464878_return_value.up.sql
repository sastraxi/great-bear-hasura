alter table "create_order"
  add column response_json jsonb default null,
  add column finished_at timestamptz default null;
