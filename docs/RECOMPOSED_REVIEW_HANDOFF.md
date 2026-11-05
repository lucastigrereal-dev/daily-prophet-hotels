# NOVA CANDIDATA RECOMPOSTA · revisão final pendente

Este trabalho não recupera os bytes da R2 perdida e não herda seus resultados. Reimplementação controlada pelo mesmo writer Hotel/KAN-40, em branch isolada kan-40/hotel-v2-recomposed-20261023. Master preservada 38ca624616bbc63756ce4e4c58dadd14d49886a7. Não houve push/PR/merge/deploy, gasto, serviço real, importador ou migração aplicada.

## Reuso e alcance

- HO-003: gate explícito de configuração compartilhado nos quatro entrypoints; runtime sem configuração devolve 503, sem fallback LAB.
- HO-004: formulário original de quatro módulos reutilizado, município/UF separados, salvamento único esperado com recibo estrito, retentativa/revisões e reconfirmação. DNA ausente difere de erro. Proposta SQL transacional NOT_APPLIED: não declarar onboarding real resolvido.
- HO-005: sessão/owner server-side e admin fail-closed por app_metadata explícito; não confiar users.role editável. Histórico autorizado separado de suspensão da escrita. Verificações sintéticas, não RLS real.
- HO-006/007: domínio puro integrado a Hoje e às ações server-side. Matching completo modelo×data, sete modelos/datas, cadência/capacidade, sem exigir vídeo ou API. Rascunhos persistidos preservados na reabertura e mudança de perfil, sem reescrever edição humana. Tela Hoje tem reaproveitamento parcial, não todos os recursos legados. Formulário/calendar UI originais reutilizados. Prévia de onboarding é preparação neutra e perguntas, não outro motor editorial/performance.
- HO-008: semente16 preservada byte a byte; quinze modelos textuais para revisão via overlay explícito dos quatro públicos, HO-TPL-015 em quarentena. Proveniência, fatos atuais, revisão exata e exportação textual sem marca de publicação. Biblioteca legada não é prova de direitos do acervo real.

## Revisões novas

C2.1 recebeu três achados independentes. C3 tem RED/GREEN e rechecagem independente parcial favorável: DNA ausente não oculta texto nem impede edição não aprovada; reparo factual que contém o valor antigo ou altera caixa/Unicode/espaços é aceito quando atual, mas ocorrência antiga independente segue negada; SQL candidato deriva fatos obrigatórios de template/versão confiáveis e recusa snapshots vazios/parciais/extras. Testes SQL são análise/modelo estático, não PostgreSQL. O P2 posterior de exportação manual anterior foi corrigido limpando o painel ao editar, salvar ou decidir conflito.

Seis P1 históricos são cobertos por testes NOVOS desta candidata: fatos/revisão exata e versão DNA efetiva; quatro públicos; perfil concluído reconfirmável; LAB com mesmo gate de exportação; buffer local separado de remoto; suspensão no servidor/domínio/SQL candidato. Fatos são autodeclarados; confirmação humana não equivale a detecção universal de falsidade.

## LAB demonstrável separado

lab/README.md contém comando para terminal nativo CUA da máquina cloud e roteiro A/B. Node/HTTP local, arquivo sintético por caminho explícito, rollback em seis etapas, retry idempotente/after_commit, restart, sete datas, edição/conflito, export, revogação, DNA ausente e suspensão. Compartilha o domínio puro, não adapter Supabase. HOTEL_MODE=lab obrigatório, bind 127.0.0.1, sem chamadas externas/segredos. Controles de cenário jamais entram no app operacional.

## Evidência e gates

Logs novos do mesmo checkout/produto em docs/evidence/C3 e C4. C4: 77/77 testes PASS, zero falha/skip; build e typecheck PASS. Inclui 18 testes LAB adapter/HTTP e processo Next sem configuração retornando 503 em três rotas. Lockfile baseline SHA256 120b578d4c659febe76aeeaf6a4e0559b30214a960a73fa25fd5e9b86aba0ea2 preservado. O checkpoint cumulativo contém source.tar, baseline.tar, changes.patch, commits.mbox e manifesto SHA256 por arquivo. Logs normalizados apenas nos espaços finais/EOF; resultados de falha RED preservados e separados.

- Testes puros, portas transpiladas com IO sintético, contratos UI, HTTP LAB/restart e runtime Next sem configuração: executados nesta árvore. Typecheck/build novos.
- SQL NOT_APPLIED; parser/execução PostgreSQL, schema instalado, auth/RLS/grants/status/owner reais, concorrência multi-processo/produção: NOT_RUN. A existência de políticas candidatas não prova que antigas permissões sejam seguras. Não aplicar esta SQL sem revisão e testes isolados próprios autorizados.
- Browser/mobile/clipboard visual: NOT_RUN pelo writer. QA CUA coordenada após congelamento. Teste de fonte/HTTP não equivale a visual PASS.
- Corpus editorial real/CSV, direitos de mídia, reservas, APIs pagas, credenciais, limites comerciais, produção: não conectados/não autorizados neste incremento.

Próxima ação: revisão independente da árvore congelada e QA LAB no mesmo namespace browser/servidor; findings retornam a este mesmo writer. Nenhum aceite operacional ou publicação é inferido dos testes sintéticos.

## Incremento C5 após REQUEST_CHANGES C4

Cliente LAB corrigido por contexto/geração da intenção, mantendo campos editáveis. Respostas tardias não limpam buffer/edição posteriores; revisão esperada continua explícita e comparação antecede reaplicação. Troca A/B ou ausência de draft limpa exportação/remoto/metadados. docs/C5_SCOPE.md descreve RED/GREEN e limites. Domínio, app, SQL e adapter são os mesmos bytes de C4; a revisão final deve usar o novo checkpoint C5, não tomar C4 como aprovada.

C5: 89/89 PASS, zero falha/skip; build/typecheck PASS no mesmo checkout. 12 provas adicionais do cliente LAB com respostas atrasadas, sucesso/falha/conflito, revisões em trânsito e limpeza de contexto. Logs C5 preservam RED e o primeiro agregado com uma asserção estática desatualizada, seguido do agregado final verde.

## Incremento C6 · residual C5-P2-01

Reconfirmação normal com draft selecionado conclui cliente e servidor em r8 sem repetição idempotente obrigatória nem falso aviso de digitação. Invalidação editorial do DNA próprio exato é separada de intenção humana; digitação e perfil externo continuam preservados para comparação. docs/C6_SCOPE.md e logs C6 registram RED/GREEN. 92/92 PASS, build/typecheck PASS; domínio/app/contrato/SQL/adapter inalterados. Nova revisão focada e smoke visual pendentes.

## Incremento C7 · trigger legado/schema

Nova migration qualifica public.check_onboarding_complete e UPDATE public.hotels, sem alterar condição/retorno/SECURITY INVOKER, trigger, SCHEMA histórico, SQL C6, grants/RLS/Auth ou search_path. Evidência independente RED PostgreSQL16.15 datada em docs/evidence/C7/postgres-RED-reference.json: 42P01 e rollback em fixture reduzida, não RPC integral. Regressão estática RED/GREEN 3/3; agregado95/build/typecheck PASS. GREEN PostgreSQL dos bytes C7 ainda pendente de executor isolado separado; produto NOT_APPLIED. docs/C7_SCOPE.md detalha limites.

## Checkpoint parcial C8A · estado de hotel existente

Nova policy restritiva UPDATE em hotels e prólogo da RPC ajustado para leitura autorizada antes do lock e recusa explícita se existente se tornar não gravável. Resto RPC e históricos preservados. 99/99 testes/build/typecheck PASS, quatro testes SQL só estáticos. C8 ainda parcial: onboarding/DNA/log dependem de REDs diretos e nova revisão; não declarar suspensão da conta inteira, DELETE ou concorrência testada. docs/C8_SCOPE.md e referência C7 datada delimitam a observação sob grants de fixture, não serviço instalado. Produto NOT_APPLIED.

## C8B · complemento após REDs auxiliares reais

Nova migration posterior à C8A preservada contém cinco policies restritivas INSERT/UPDATE para onboarding/DNA e INSERT ativo para log, sem alterar SELECT, RPC, grants/admin/definer/calendário ou escopos excluídos. Evidência PostgreSQL16.15 run-state-KNnLdQ8T confirmou42REDs, incluindo33auxiliares; C8A GREEN78 isolado. Testes estáticos4/4, agregado103/build/typecheck PASS. C8B SQL NOT_APPLIED pelo writer; revisão e GREEN PostgreSQL novos pendentes. docs/C8B_SCOPE.md delimita contrato, matriz/provas, ordem e limites; não transforma claims/grants de fixture em Auth/ACL reais.
