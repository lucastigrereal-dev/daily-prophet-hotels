# C10: security candidate for disposable LAB only

Input a3db096. Apply the historical nine-file chain, MIGRATION_BLOCO5_TAXONOMY.sql, then MIGRATION_C10_LAB_SECURITY_NOT_APPLIED.sql only in a new isolated database with synthetic data. This is not an installation instruction for a real service. PostgreSQL 16 is required (explicit membership inheritance and invoker views). A role/policy/trigger collision aborts; never silently drop preexisting objects.

Users: self SELECT only, no client role/link mutation. Auth insert provisions a public identity with fixed hotel_owner role; user metadata cannot supply authority. Activity audit: own SELECT, no client writes. Three views use invoker rights and security barriers. Revoked users lose hotel access with old JWTs through a restrictive policy.

RPC role: NOLOGIN, NOBYPASSRLS, no ownership of tables; explicit inherited authenticated membership ensures all existing restrictive policies apply. Direct mutation of the five transactional tables is revoked. The four original mutating RPCs retain owner/identity/state guards and run as the restricted role. Manual calendar inserts and owner reports have narrowly scoped RPCs. Owner reports never assert platform-confirmed publication; task replay does not change timestamps, but a real state transition adds a new event.

Onboarding completion derives its profile from answers in SQL. Template eligibility uses the versioned seed's pillar, audience, effort and resource requirements. Create-window enforces draft metadata/cadence. Review/export rejects prohibited claims; unapproved human text remains editable. This does not verify the external truth of owner-provided facts or grant media rights.

Execution/campaign clients await the new RPCs and expose errors/retry. Execution shows export revision and OWNER_REPORTED history separately. Existing draft text is never rewritten by this migration.

References: https://www.postgresql.org/docs/16/ddl-rowsecurity.html ; https://www.postgresql.org/docs/16/sql-createfunction.html ; https://www.postgresql.org/docs/16/sql-createview.html . Tests and receipts live in the isolated review's security-r1 artifact. Unit counts are not the ten acceptance criteria. Support workflows, full session expiration and all negative combinations require explicit proof; no 90% claim follows from this change.
