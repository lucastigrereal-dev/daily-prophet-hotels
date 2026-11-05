# C8A · checkpoint parcial: hotels existente e prólogo de onboarding

Não é fechamento final de C8: gates auxiliares aguardam RED PostgreSQL direto e revisão do escopo. Nova migration candidata em sql/MIGRATION_C8_EXISTING_HOTEL_STATE_NOT_APPLIED.sql, posterior a C7/C6; históricos preservados. Produto NOT_APPLIED.

Policy nova AS RESTRICTIVE FOR UPDATE TO authenticated em public.hotels. USING e WITH CHECK exigem owner_id=auth.uid() e status lead/onboarding/ativo. SELECT autorizado não é alterado. UPDATE/lock de pausado/cancelado/NULL é recusado; não há permissão concedida nem rota de reativação/admin.

O prólogo da RPC lê o hotel autorizado sem lock e recusa ID/estado inválidos antes do lock. Em seguida bloqueia por ID validado+actor e rechecagem de estado. Existente observado que não puder ser bloqueado gera erro explícito, sem cair em INSERT/novo hotel/recibo. Advisory lock, actor, invoker/search_path vazio, CAS/replay e todo restante do corpo são byte a byte preservados, conferidos por teste estático.

Aplicação única, não idempotente: colisão de nome de policy aborta a transação, sem remover/substituir silenciosamente políticas. Nada deste pacote deve ser aplicado em serviço real. Não altera SELECT, DELETE, INSERT de hotels, grants, users/admin, UNIQUE(owner_id) ou contrato multihotel. Não é suspensão da conta inteira nem prova de corrida em duas sessões.

Evidência C7 relida: run-full-C1rseqN7, 2026-10-23 16:51:35–36 UTC, results SHA256 d9ded93f234ed4c03ee86e42b6d15b619b838a84a5137a341557ec68a2ac1caa. Sob grants de fixture e role sem bypass, UPDATE direto reativou hotel pausado, embora RPCs negassem. Baseline sem grants falha 42501; não se fornecem grants neste patch. Observação não equivale a exposição instalada. Referência datada em docs/evidence/C8A/state-RED-reference.json.

RED estático 0/4 → GREEN 4/4; agregado 99/99, build/typecheck PASS. Isso não executa PostgreSQL/RLS. GREEN C8 e REDs onboarding/DNA/log pertencem ao executor PG isolado já designado. Só após evidência/revisão esses auxiliares poderão entrar na candidata. Auth/JWT/SSR/PostgREST, ACL instalada, DELETE/multihotel/concorrência e produto operacional continuam fora do aceite. Sem SQLapply, serviço real, push, merge, deploy, credenciais ou gasto pelo writer.
