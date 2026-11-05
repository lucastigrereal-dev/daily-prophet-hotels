# C7 · qualificação mínima do trigger legado

Nova migration candidata: sql/MIGRATION_C7_ONBOARDING_TRIGGER_SCHEMA_NOT_APPLIED.sql. Não altera SCHEMA_V2 histórico nem HOTEL_RECOMPOSED_CANDIDATE_NOT_APPLIED (C6). C6 e evidências anteriores permanecem preservados.

Apenas substitui public.check_onboarding_complete() no mesmo schema, qualificando o alvo UPDATE como public.hotels. Condição completado=true e progresso_percent=100, RETURN NEW, linguagem e SECURITY INVOKER são preservados. Não remove/recria trigger, não afrouxa search_path da RPC, não adiciona configuração à função, não muda grants/RLS/Auth. CREATE OR REPLACE propõe manter a ligação do trigger; OID/propriedades serão conferidos pelo ensaio PostgreSQL separado, não presumidos instalados.

## Evidência RED independente já existente

PostgreSQL 16.15, run-VTgYZ57w, 2026-10-23 16:21:45 UTC. Fonte: /workspace/shared/hotel-pg-qa/runs/run-VTgYZ57w/evidence/result.json, SHA256 e31d4655b09729a89c7938395585ded45f1bcf80d317650a5733682c46c438f3. PG21 confirmou controle normal; PG23 reproduziu SQLSTATE 42P01 com search_path vazio e trigger original verbatim; PG24 confirmou rollback. Tabelas reduzidas compatíveis, socket Unix, TCP desativado, sem Auth/JWT/RLS/RPC integral. O escritor leu essa evidência; não executou PostgreSQL. Referência com casos/horários preservada em docs/evidence/C7/postgres-RED-reference.json.

## Testes e limites

Regressão estática nova: RED 1/3 PASS (migration ausente), GREEN 3/3. Compara corpo legado byte a byte após reverter apenas UPDATE public.hotels→UPDATE hotels; garante SECURITY INVOKER, ausência de alteração de trigger/search_path/grants/RLS/Auth e hashes intactos de SCHEMA histórico/C6. Não é parser/execução PostgreSQL nem GREEN mecânico.

A sequência candidata permanece SCHEMA_V2 → SPRINT2 → WAVE1 → reparo C7 → SQL candidato C6, sujeita à inspeção da instalação e aprovação própria. Não aplicar em serviço real. GREEN PostgreSQL isolado novo será executado pelo revisor coordenado, em run separado, com estes bytes congelados. SQL de produto NOT_APPLIED; integração Auth/RLS/JWT/grants/vínculo users e RPC completa permanecem NOT_RUN. Sem push, merge, deploy, credenciais, serviços reais ou gasto.

Agregado novo do mesmo checkout: 95/95 testes PASS, zero falha/skip; build/typecheck PASS. Estes resultados incluem os três testes SQL estáticos, não substituem o GREEN PostgreSQL separado.
