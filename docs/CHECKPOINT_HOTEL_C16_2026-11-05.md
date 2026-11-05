# Hotel C16 — checkpoint para Aurora Commander

Atualizado em 04/11/2026, 21h20 (America/Sao_Paulo). Writer e integrador: Codex.

## Projeto e candidata

- HOTEL INTELLIGENCE / DAILY PROPHET HOTELS. Missão: concluir os oito critérios visuais pendentes da C16 sem recriar o produto.
- Repositório local: `{HOTEL_SOURCE}`.
- Branch verificada: `codex/hotel-c16-qa-visual-20261104`.
- Commit-base: `4495a6ff7ab653b77f141cec110f4fde9273db69`. Oito arquivos locais alterados/novos, sem commit; nenhum remote nesta candidata.
- Manifesto da árvore corrigida: `..\qa-visual-20261104b\source-manifest.json`, 198 arquivos conferidos. SHA-256 agregado: `83822a2f681f70c0ae86a377957bfdc5bbaace6218c266bed24a257a9511e3bb`.

## Implementação concluída nesta rodada

1. Retomada do onboarding usa a seção confirmada pelo servidor: M1/M2/M3 retomam M2/M3/M4 sem reenviar etapas anteriores. Respostas, revisão e buffers locais preservados.
2. Reautenticação do editor conserva janela, data, título e texto local. O usuário e o hotel precisam coincidir com a sessão autenticada antes de abrir o draft solicitado.
3. Middleware conserva o destino completo no login, inclusive quando outra aba já recuperou a sessão. Retornos externos e ciclos para login/cadastro são bloqueados.
4. Recuperação de acesso informa logout pendente até o recibo real. Erro permite repetir apenas o encerramento da sessão, sem repetir a alteração da senha.

Arquivos de produto: `app/onboarding/actions.ts`, `app/onboarding/page.tsx`, `app/dashboard/post-do-dia/page.tsx`, `lib/supabase/middleware.ts`, `app/auth/reset/page.tsx`.
Testes: `tests/ui-feedback-regressions.test.mjs`, `tests/auth-reset-receipt.test.mjs`, `tests/auth-return-context.test.mjs`.

## Verificações reais

| Verificação | Resultado | Evidência |
|---|---|---|
| Regressões de retomada antes/depois | 5 FAIL → 5 PASS | Saída real nesta conversa e `evidence/resume-red-green.json`, `resume-green.log` |
| Recibo de logout antes/depois | 2 FAIL → 2 PASS | Execução do agente e suíte final |
| Middleware sem sessão | 1 FAIL → 1 PASS | `evidence/middleware-red.log`, `middleware-green.log` |
| Middleware com sessão já recuperada | 1 FAIL; correção validada | `evidence/middleware-authenticated-red.log`, `middleware-final-green.log` (3 PASS) |
| Primeira suíte integrada | 181 PASS / 1 FAIL | `evidence/final-tests.log`; falha por Next não ficar pronto dentro do prazo, sem mudança do limite do teste |
| Último typecheck | PASS, exit 0 | `evidence/validated-typecheck.log` |
| Último build | PASS, exit 0 | `evidence/validated-build.log` |
| Última suíte completa | **185 PASS / 0 FAIL / 0 SKIP** | `evidence/validated-tests.log` e `validated-results.json` |
| Backend real GoTrue/PostgREST/PostgreSQL | **5 PASS / 0 FAIL** | `..\qa-visual-20261104b\evidence\backend-verification.json`; atores sintéticos exclusivos e controles de ownership positivos/negativos |
| Diff final | PASS | `git diff --check`; apenas avisos de conversão de fim de linha, sem erro |
| Gastro preservado | PASS, 280 arquivos sem diferenças | `evidence/gastro-preservation-final.json`; HEAD/status/relatório também iguais |

Revisões independentes React e TypeScript encerradas sem achados acionáveis restantes nos diffs corrigidos. São revisões de código, não homologação visual.

## Matriz dos oito critérios visuais

Nenhum critério possui aceite integral. PASS parcial abaixo descreve subcasos observados; não equivale a PASS integral.

| Critério | Estado atual | Evidência e restante |
|---|---|---|
| C02 — autenticação e recuperação | PASS parcial / restante NOT_RUN | Login e cadastro reais na base. Correções de retomada/logout passaram em componentes; backend comprovou outro proprietário sem acesso a quatro tabelas e sem permissão de editar/exportar o hotel de A. Faltam sessões A/B/admin, expiração e recuperação integrada com links. |
| C04 — M1–M4 e DNA | PASS parcial / restante NOT_RUN | M1/M2 preenchidos, recibos visuais e chegada ao M3. Faltam M4, DNA final e comparação após outra sessão no navegador. |
| C05 — falhas e persistência | PASS parcial / restante NOT_RUN | Falha M1/M2 preservou campos e alerta; retry M1 avançou. Snapshot SQL do run anterior não foi produzido. No novo run, 4 replays idempotentes e um único evento final de onboarding foram comprovados; faltam falhas/reabertura por UI dos demais módulos. |
| C06 — Hoje e alternativa | NOT_RUN no navegador | Pendente: cinco minutos sem câmera, fatos expirados/ausentes, alternativa e biblioteca indisponível/vazia. |
| C07 — sete datas | NOT_RUN no navegador | Backend PASS: sete IDs/datas de 04 a 10/11, 3 sugestões/4 preparos e repetição sem mutação. Faltam UI, reabertura e janela impossível sem parcial. |
| C08 — edição e conflito | NOT_RUN no navegador | Backend PASS: revisão humana r2 persistida e revisão antiga rejeitada (HTTP 400), vencedora preservada. Faltam conflito visível entre abas e formatos/DNA reabertos. |
| C09 — exportação e histórico | NOT_RUN no navegador | Backend PASS: exportação exata de 911 bytes, SHA-256 confrontado com a revisão SQL, um único evento e replay sem mutação. Clipboard, alternativa manual, falhas e histórico via UI pendentes. |
| C10 — jornada e acessibilidade | PASS parcial / restante NOT_RUN | Login da candidata corrigida em 360 px: sem rolagem horizontal; labels e Tab/Shift+Tab/Enter conferidos. Falta jornada autenticada e os demais estados obrigatórios. |

Capturas reais: `{LOCAL_UI_EVIDENCE}\2026\11\02\01a19a16-572e-7de1-bb41-ed68731a18e9\hotel-c16-20261104` (base) e `hotel-c16-20261104b` (corrigida).

## Ambiente atual e bloqueio humano

- LAB anterior encerrou; o READY antigo não é atual. Sua rede vazia e exclusiva foi removida após verificação de ownership e ausência de containers (`evidence/prior-runtime-closeout.json`).
- Novo LAB: `{HOTEL_LAB}\qa-visual-20261104b`.
- Interface: `http://localhost:54716`; API: `https://127.0.0.1:54717`. Tag: `hotel-c16-visual-e33734b177`. READY e heartbeat atual conferidos às 21h14.
- PostgreSQL/GoTrue/PostgREST reais e descartáveis, tmpfs, imagens locais existentes e portas publicadas apenas em 127.0.0.1. Nenhum banco produtivo, segredo real ou alteração de trust do host.
- Chrome voltou a responder. Login público observado na candidata corrigida.
- O certificado anterior expirou. O novo é emitido por `Hotel disposable loopback LAB`, SHA-256 `f8c2fee81731676485d9b6c05a10d75c4378d13c1d6f945be8ffc60b38adbb67`, expira em 05/11 às 01h10 (Brasília).
- A aba `https://127.0.0.1:54717/auth/v1/health` aguarda ação manual de Lucas. A política do controle do navegador exige que o usuário realize a exceção do aviso de segurança; uma autorização verbal não substitui essa ação. Nenhum aviso foi contornado pelo agente.

## Agentes, próxima ação e limites

- `review_python_etapa1`: investigação dos bugs de retomada e revisão estática do novo harness, sem escrita no produto.
- `review_seguranca_etapa1`: correção isolada de reset e preparação de cinco casos reais de backend, com novos atores sintéticos exclusivos. Script executado pelo controller: cinco casos PASS, sem alterar atores da QA visual.
- `hotel_react_review`: revisão de hooks/estado concluída, sem novos achados.
- `hotel_typescript_review`: revisão de contratos, inputs e middleware concluída após correções, sem novos achados.
- Próxima ação: continuar a jornada visual autenticada assim que Lucas validar manualmente o novo certificado. Frentes independentes de implementação, revisão, build, tipos, suíte e cinco casos reais de backend concluídas nesta rodada.
- Sem commit, push, merge, deploy, publicação, gastos ou recursos produtivos. Gastro integralmente fora do escopo de escrita.

A Commander não tem acesso automático ao computador. Este arquivo e seus recibos precisam ser compartilhados explicitamente para uso em outro ambiente.


## Checkpoint final local — 05/11/2026 15h13

Tipos e build PASS; suíte completa 190 PASS, 0 FAIL, 0 SKIP. Header/logout e links sem rota corrigidos e revisados. Fonte atual 529ee58ca6fe66aedfeadf4bab7663a124c98fddcf0e67631f12b09db3b24f6e. Dossiê atualizado com a seção 31. Backup GitHub sanitizado e recibos remotos ainda em finalização; Notion contém o relatório. Sem merge, deploy ou banco produtivo. QA visual integral ainda pendente.
