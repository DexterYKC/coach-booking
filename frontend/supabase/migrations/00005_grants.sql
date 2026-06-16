-- Table-level GRANTs for PostgREST roles. RLS policies still gate row access
-- for anon/authenticated; this just allows the roles to reach the tables at
-- all (service_role bypasses RLS but still needs base table privileges).
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
