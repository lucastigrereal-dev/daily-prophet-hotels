# C8B · complemento mínimo dos gates auxiliares

Nova migration sql/MIGRATION_C8B_AUXILIARY_STATE_NOT_APPLIED.sql, posterior à C8A preservada. Cinco policies novas AS RESTRICTIVE TO authenticated, específicas por comando: onboarding_respostas e hotel_content_preferences INSERT WITH CHECK e UPDATE USING+WITH CHECK, correlacionadas ao hotel owner em lead/onboarding/ativo; hotel_execution_log somente INSERT owner+ativo. USING limita origem; WITH CHECK limita destino da troca de hotel_id. Nenhuma nova policy SELECT/ALL, função, grant, admin, definer ou alteração de calendário.

SELECT histórico permanece com suas policies anteriores. Não é suspensão de conta inteira, contrato multihotel, DELETE ou fechamento de todos os privilégios instalados. Baseline sem grants continua contrato pendente/42501. Nenhum GRANT é fornecido. C8A/RPC, C7/trigger, C6 e schemas históricos são byte a byte preservados. Aplicação única: colisão de nome aborta a transação, sem remoção/recriação silenciosa. Produto NOT_APPLIED.

## Evidência real relida antes de implementar

PostgreSQL16.15, run-state-KNnLdQ8T, 2026-10-23 17:18:39–40 UTC. Diretório /workspace/shared/hotel-pg-qa/c8-state-qa/runs/run-state-KNnLdQ8T/evidence. red-results.json SHA256 450b4facb79a086ac6dba6a2a3e8f90c5b761bd52cadba41ee3a2424e051149f: 42 RED_CONFIRMED, zero inconclusivos, todos SQLSTATE00000 com before diferente de after. São 15 onboarding, 15 DNA, três inserções de log e nove hotels, divididos entre pausado/cancelado/NULL. Auxiliares cobrem INSERT/UPDATE/UPSERT e troca de hotel_id em ambas direções. Dois hotéis do mesmo dono só compõem fixture negativa, não produto multihotel.

C8A green-results.json SHA256 fb69014f065847b23ba93bcaedda991f287e2db56e107bd3ca64f40d89c2f4d1: 78 expectativas satisfeitas para hotels/prólogo/quatro RPCs, não homologa os auxiliares. Ambos rollback verificado e shutdown final0. Metadados, nomes dos 42 probes e hashes dos snapshots em docs/evidence/C8B/postgres-state-RED-reference.json; provas completas e matriz em /workspace/shared/hotel-pg-qa/c8-state-qa/deliverable.

Identidade/claims e grants eram somente fixture SQL, não JWT verificado nem ACL instalada. Esses REDs são observações de defeito sob tal contrato, não aprovações de segurança. O writer só leu os resultados; não iniciou PostgreSQL nem aplicou SQL.

## Verificação desta candidata e próximo gate

Estático RED 1/4 PASS → GREEN 4/4; agregado novo 103/103 PASS, zero falha/skip; build/typecheck PASS. Testes exigem exatamente os cinco gates, ambos os lados do UPDATE e hashes históricos intactos; não substituem parser/execução RLS.

Próximo executor PG independente deve inverter os 33 REDs auxiliares em cluster/transação novos, preservar SELECT/snapshots/eventos, repetir as nove recusas hotels e regressões de RPC/replay/CAS/rollback/A-B/identidade nula. Usar a cadeia de fixture já revisada, acrescentando C8A e C8B nesta ordem, sem ampliar grants ou inventar bypass. Auth/JWT real, SSR/PostgREST, ACL de produção, concorrência entre sessões, DELETE e operação de conta inteira continuam não homologados. Sem serviço real, push, merge, deploy, credenciais ou gasto nesta implementação.
