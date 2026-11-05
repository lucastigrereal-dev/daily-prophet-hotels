# Pré-publicação — HOTEL INTELLIGENCE / DAILY PROPHET HOTELS

> **Parecer vigente — seção 13:** cópia bruta de 199 arquivos permanece FAIL. A seleção corrigida exige **oito exclusões**, resultando em **191/199 arquivos de fonte/testes**, antes de documentos e recibos. As seções anteriores preservam o histórico das análises preliminares.

**Data:** 05/11/2026 — America/Sao_Paulo
**Auditor:** opensource-sanitizer, independente; produto somente leitura.
**Cópia bruta dos 198 arquivos: FAIL.**
**Seleção proposta: PASS COM LIMITES**, condicionada às sete exclusões, ao isolamento da história local e ao scan diferencial de alterações posteriores.

## 1. Escopo e integridade

- Fonte: `candidate/source`; branch `codex/hotel-c16-qa-visual-20261104`; commit-base `4495a6ff7ab653b77f141cec110f4fde9273db69`.
- Manifesto: `qa-visual-20261104b/source-manifest.json`, 198 caminhos distintos. Identificador agregado registrado: `83822a2f681f70c0ae86a377957bfdc5bbaace6218c266bed24a257a9511e3bb`.
- 198 arquivos presentes; 198 hashes individuais SHA-256 conferidos e coincidentes no scan-base. Foram analisados 198 arquivos de texto, totalizando 1.229.962 bytes. Nenhum caminho absoluto ou travessia `..` no manifesto.
- O scan não executou código, testes, build, migrações, helpers legados ou chamadas a provedores. Não houve uso dos tokens, publicação, alteração de Git ou acesso a banco.
- Valores de autenticação, contatos e destinos reais não são reproduzidos. A classificação dos JWTs usou somente metadados locais de role/emissor/expiração.
- `.env` real, PEM e arquivos de credenciais não foram abertos. Variantes conhecidas foram verificadas somente por nome/metadados. `.env.example` foi inspecionado como modelo.
- Este preflight não substitui os 185 testes funcionais, build/typecheck ou cinco casos reais de backend registrados pelo integrador; não homologa os oito critérios visuais.

## 2. Resultado por categoria

| Categoria | Cópia bruta | Seleção proposta | Evidência e limite |
|---|---|---|---|
| Integridade | PASS | PASS no scan-base | 198/198 hashes individuais coincidentes; sete exclusões explícitas |
| Material de autenticação embutido | FAIL | PASS no scan-base | Três JWTs em material legado excluído |
| PII de contato | PASS no scan | PASS no scan | Nenhum e-mail pessoal; dois placeholders de formulário de login/cadastro classificados como exemplo |
| Referências internas | FAIL | PASS no scan-base | Diretórios pessoais e rede privada em arquivos excluídos |
| Provider real fixado | FAIL para cópia sem tratamento | PASS no scan-base | Endpoints legados excluídos; remanescentes são cenários explícitos de teste inválido/sintético |
| Arquivos perigosos no manifesto | PASS | PASS | Sem `.env` real, chave, PEM, credencial, mapas, dependências ou caches selecionados |
| Configuração de exemplo | WARN | WARN | Configuração pública do app coberta; LAB/importadores usam variáveis adicionais |
| Licença e procedência | WARN | WARN | Sem LICENSE/NOTICE/COPYING nem campo license no package.json |
| Histórico Git local | FAIL para transportar integralmente | Não transportar | 19 commits e JWTs no histórico dos caminhos auditados |
| Patch posterior de navegação/logout | NOT_RUN nesta versão | Condição pendente | Requer scan diferencial ao concluir os novos arquivos |

## 3. Achados do conteúdo bruto

| Categoria | Localização | Classificação sem valores | Tratamento na cópia pública |
|---|---|---|---|
| JWT | `RELATORIO_COMPLETO_SESSAO.md:30` | Supabase, role anon, expiração futura no instante da leitura | Excluir relatório legado |
| JWT | `create_test_data.py:9` | Supabase, role anon, expiração futura no instante da leitura | Excluir helper legado |
| JWT | `scripts/import_csv_direct.py:21` | Supabase, role anon, expiração futura no instante da leitura | Excluir helper legado |
| Diretório pessoal | `IMPORTACAO_CONCLUIDA.txt:17` | Caminho absoluto de ambiente pessoal | Excluir documento |
| Diretório pessoal | `PROMPT_02_PATCH.md:4` | Caminho absoluto em instrução histórica | Excluir documento |
| Diretórios pessoais | `RELATORIO_COMPLETO_SESSAO.md:72,147,163,177,208` | Referências internas de ambiente | Excluir documento |
| Rede privada | `RELATORIO_COMPLETO_SESSAO.md:212` | Endereço privado em material histórico | Excluir documento |
| Diretório pessoal | `scripts/import_csv_direct.py:23` | Caminho fixado para importação local | Excluir helper |
| Destino de provider legado | `IMPORTACAO_CONCLUIDA.txt:20,258` | Referência de painel/projeto, sem confirmação de ambiente | Excluir documento |
| Destino de provider legado | `RELATORIO_COMPLETO_SESSAO.md:28,182` | Referência de projeto associada ao token legado | Excluir documento |
| Destino de provider legado | `create_test_data.py:8` | Endpoint fixado em helper que não deve ser executado no LAB atual | Excluir helper |
| Destinos de provider legado | `execute_migration.py:110,111` | Referências a projeto/painel no helper de migração | Excluir helper |
| Destino de provider legado | `scripts/import_csv_direct.py:20` | Endpoint fixado no importador antigo | Excluir helper |

Os três JWTs têm role **anon**, não service_role nem senha de usuário. Uma chave anon pode ser destinada ao cliente público, mas sua segurança depende das regras efetivas do backend. Não foram comprovadas revogação, segurança do destino legado ou natureza descartável desse destino. Nenhum token foi enviado, utilizado ou testado em rede. A política desta auditoria bloqueia a publicação bruta e recomenda retirar os arquivos que fixam esses tokens/endpoints.

## 4. Sete exclusões exatas — originais preservados

Excluir somente da cópia de publicação; não apagar, mover ou editar os originais:

1. `IMPORTACAO_CONCLUIDA.txt`
2. `PROMPT_02_PATCH.md`
3. `RELATORIO_COMPLETO_SESSAO.md`
4. `create_test_data.py`
5. `execute_migration.py`
6. `scripts/import_csv_direct.py`
7. `EXEMPLOS_DADOS_CASO_SUCESSO.sql`

No manifesto-base, **198 − 7 = 191 arquivos** selecionados. Arquivos novos após esse manifesto precisam ser adicionados conscientemente e auditados; a contagem final poderá mudar.

A sétima exclusão é preventiva de procedência: o arquivo de exemplos contém cinco referências por URL a redes sociais/OTA. Não foi comprovada autorização de uso, licença ou veracidade comercial de eventuais textos/dados de terceiros. O integrador concordou em excluí-lo por não ser necessário ao runtime C16. Isso não é constatação de violação autoral ou dado privado.

## 5. Rechecagem lógica da seleção

Aplicadas as exclusões em memória, não restaram ocorrências nos padrões de JWT, API secret, credencial de banco, AWS, chave privada, token GitHub/Google/Slack/SendGrid/Mailgun, e-mail pessoal, SSH interno, rede privada, diretório pessoal ou referência ativa a arquivos secretos internos.

As referências de formato de provider remanescentes estão em `tests/domain.test.mjs` e `tests/runtime-config.test.mjs`: contextos explícitos de URLs de exemplo/invalidade/HTTP/chaves sintéticas a serem recusadas. Não são destinos operacionais configurados para este backup.

Regex estático reduz risco de padrões conhecidos. Não prova ausência matemática de todo dado sensível, valor ofuscado, formato proprietário ou informação cuja sensibilidade depende de contexto. Nenhum valor sensível foi emitido por estas verificações.

## 6. Artefatos locais fora do upload

`node_modules/` e `.next/` existem no diretório de trabalho e estão fora do manifesto. As variantes conhecidas de `.env` real verificadas por nome não estavam presentes. Não publicar caches/dependências porque existem no workspace.

Publicar por seleção explícita, não pela pasta inteira. Excluir `.git/`, pastas de QA com chaves efêmeras, dumps, credenciais, mapas de fonte, sessões e logs arbitrários. Conteúdo fora dos 198 caminhos não foi coberto por este scan e não deve ser acrescentado sem nova avaliação.

## 7. Configuração

| Grupo | Variáveis | Situação |
|---|---|---|
| App público | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Presentes em `.env.example`; conferir sempre destino e chave pública em ambiente permitido |
| LAB textual separado | `HOTEL_MODE`, `HOTEL_LAB_STATE`, `PORT` | Referenciadas em `lab/server.mjs`, não incluídas no exemplo do app; são parâmetros locais, sem prova de produção |
| Importadores legados | `SUPABASE_SERVICE_ROLE_KEY` | Referenciada em seis helpers TypeScript; ausente no exemplo; jamais tornar pública ou fornecer chave real para esta missão |
| Importador CSV legado | `API_URL` | Referenciada em `scripts/import-csv-posts.ts`, ausente do exemplo; integração operacional não presumida |

A preservação dos importadores no backup não comprova execução, necessidade para C16 ou aprovação para operar bancos. Não conectar banco produtivo nem executar esses helpers como parte do upload.

## 8. Auditoria do histórico

Foram contados **19 commits em todas as refs locais**. A inspeção dos patches dos caminhos candidatos, sem textconv/ext-diff, analisou **1.605.110 bytes** e encontrou três ocorrências de JWT nas linhas adicionadas/removidas dos mesmos três arquivos legados. Valores e contatos de autores não foram emitidos.

Esse histórico não corresponde a um único commit inicial saneado. Não transportar `.git`, refs ou commits locais para a publicação. O integrador planeja construir uma branch de snapshot no repositório remoto existente, sem publicar a história local.

Esta auditoria não escaneou o histórico remoto inteiro e não certifica sua sanitização. A retirada de um arquivo da árvore atual não apaga versões que tenham sido publicadas antes. Qualquer exposição remota anterior requer investigação específica; este auditor não revoga credenciais, reescreve história ou apaga dados por iniciativa própria.

## 9. Licença e direitos

Não há LICENSE, NOTICE ou COPYING no manifesto nem propriedade license no package.json. Não inferir MIT, Apache, domínio público ou autorização para relicenciar. Um backup público não é automaticamente uma distribuição com licença aberta.

Não houve auditoria jurídica, SBOM ou checagem de todas as licenças transitivas. O domínio C16, os exemplos sintéticos e o acervo legado devem continuar separados no relatório DEV. Fotos, avaliações, posts, músicas e referências de terceiros não adquirem autorização de uso por inferência.

## 10. Procedimento de publicação recomendado

1. Preservar a fonte validada e suas evidências. Derivar a cópia pública do manifesto e aplicar as sete exclusões.
2. Escanear os arquivos novos/alterados depois do manifesto, inclusive navegação/logout e seu teste, e registrar hashes finais.
3. Acrescentar somente relatórios/recibos sanitizados, usando caminhos portáveis. Não inserir relatórios antigos com tokens, logs de autenticação ou PKI efêmera.
4. Salvar em branch exclusiva no repositório correto, sem modificar/mesclar a padrão e sem transportar a história local. Preservar a proibição de deploy, inclusive eventual preview automático remoto.
5. Ler o conteúdo publicado de volta e confrontar inventário/hashes. Registrar commit remoto e limites. Upload não é homologação.

## 11. Condição diferencial e responsabilidade

Esta versão cobre o manifesto-base. O integrador informou uma correção paralela de Header/MobileNav/Admin e novo teste; a aprovação pública está condicionada à leitura e ao scan desses diffs finais e de relatórios novos. Os arquivos finais serão relacionados em apêndice quando entregues.

Nenhum arquivo do produto ou do Gastro foi alterado pelo auditor. O único artefato final sob sua responsabilidade é este relatório. Nenhum link operacional, token ou valor de credencial foi incluído.

## 12. Adendo de fechamento incremental — 05/11/2026

**Resultado do scan incremental: PASS COM LIMITES.** A condição de revisão de conteúdo dos quatro arquivos de navegação/logout foi atendida para os hashes abaixo. O FAIL do conteúdo bruto e a restrição de não transportar os 19 commits locais permanecem inalterados.

O inventário atual esperado é de 199 arquivos de fonte/testes: os 198 do manifesto-base e o novo teste de navegação. Com as mesmas sete exclusões, a seleção passa a **192/199 arquivos**, antes de relatórios, recibos ou configuração de publicação acrescentados conscientemente. A contagem foi conferida no momento de gravar este adendo.

| Arquivo incremental ou dossiê | Bytes | SHA-256 efetivamente lido | Scan de conteúdo |
|---|---|---|---|
| components/layout/Header.tsx | 2668 | efb4e2147df43899fb2fbebda3905fa2374ecbdcd80270ca3ee5aa1dec29e103 | PASS — zero achados |
| components/layout/MobileNav.tsx | 2447 | 1dbb9649f56c244f09bc62510fedb2677bdfd712860a93cec2ea2341fd5f2378 | PASS — zero achados |
| app/admin/page.tsx | 3984 | df3d984784727948d943f7397740a581bf73ea583d3364143f573121595e0b70 | PASS — zero achados |
| tests/navigation-session-receipts.test.mjs | 7639 | 525183b57fb46b13d76f5302458000eb6dff26b4601e9e0a2152164ed1921bec | PASS — zero achados |
| RELATORIO_DEV_HOTEL_C16_2026-11-05_PERPLEXITY.md | 101549 | df88a01631d9f1addee6df39274234c24590e6e1fd0d9dbbce38f0928c89ac77 | PASS — zero achados |

Os quatro arquivos foram lidos integralmente, sem executá-los. Não houve ocorrência nos padrões auditados de segredo/token, credencial de banco, chave privada, e-mail pessoal, rede privada, SSH, diretório pessoal ou provider real fixado.

O dossiê portátil examinado tinha **101.549 bytes** e hash **df88a01631d9f1addee6df39274234c24590e6e1fd0d9dbbce38f0928c89ac77**. Este é o hash efetivamente observado, diferente do valor de preparação informado antes do scan. A diferença foi comunicada ao integrador, sem presumir falha. A aprovação de conteúdo corresponde à versão lida, não a um hash anterior.

O próprio preflight, antes deste adendo, foi relido integralmente: 11.664 bytes, hash d23db8b542c5e3871284e18358d4796a5e64677d83300403eb3ffc253c1fbc53, sem achados. O adendo usa apenas caminhos relativos, contagens e hashes; não inclui valores de credenciais ou destinos reais de provider.

### Fronteiras que permanecem

- Novas versões dos arquivos ou do dossiê precisam de confronto com estes hashes. Recibos posteriores de validação devem permanecer saneados, sem credenciais, caminhos pessoais ou logs de autenticação.
- O relatório DEV original local, com apêndices de ambiente, não foi aprovado para publicação bruta. Esta aprovação cobre a variante portátil indicada na tabela.
- Não houve novo teste, build, execução de componente, serviço, Docker, SQL ou navegador nesta frente. Resultado do sanitizer não substitui a validação funcional em curso nem o aceite visual.
- A frente de publicação deve conferir que a branch de snapshot não leve o histórico local, os sete arquivos excluídos, artefatos de QA, chaves efêmeras, dependências ou caches. Sua proteção contra preview/deploy automático é uma verificação operacional separada deste scan.
- As advertências de licença, procedência e configuração da análise-base continuam válidas. Nenhum arquivo do produto foi editado pelo auditor.

## 13. Achado tardio e oitava exclusão — 05/11/2026

**O parecer vigente substitui a seleção preliminar de 192/199 pela seleção de 191/199, mantendo o FAIL do conteúdo bruto e a proibição de transportar os 19 commits locais.**

A defesa final do integrador na cópia de publicação identificou um caminho pessoal em **scripts/import-csv-posts.ts:117**. Este auditor confirmou o achado sem imprimir o valor. O arquivo já existia na fonte; não se trata de segredo ou caminho introduzido pelo patch de navegação.

O padrão preliminar de caminhos Windows era limitado ao drive C. A rechecagem ampliou a regra para qualquer letra de drive e ambos os separadores de diretório, sem diferenciar maiúsculas/minúsculas. Esse limite anterior é reconhecido explicitamente; o parecer preliminar não deve ser usado sem este adendo.

| Verificação complementar | Resultado observado |
|---|---|
| Regra ampliada sobre todos os 199 caminhos de fonte/teste | 199 arquivos lidos; nove ocorrências de caminhos pessoais em arquivos legados |
| Caminhos pessoais remanescentes após oito exclusões | Zero ocorrências |
| Referências ao basename import-csv-posts nos entrypoints app/lib/components, testes e configs conferidos | Nenhuma; inclui o novo teste de navegação |
| Helper legado adicional | scripts/import-csv-posts.ts, SHA-256 016c18aa1e0a21122826e1ceffe48814a3bac81f1b91dbb9eb338077e1310f0d |
| Alteração do helper ou da fonte pelo auditor | Nenhuma |

### Lista vigente de oito exclusões

1. IMPORTACAO_CONCLUIDA.txt
2. PROMPT_02_PATCH.md
3. RELATORIO_COMPLETO_SESSAO.md
4. create_test_data.py
5. execute_migration.py
6. scripts/import_csv_direct.py
7. EXEMPLOS_DADOS_CASO_SUCESSO.sql
8. scripts/import-csv-posts.ts

Aplicar as exclusões somente ao índice/cópia publicável. Preservar todos os originais. A aritmética da fonte atual é **199 − 8 = 191 arquivos**, antes de acrescentar documentos, recibos ou configurações de publicação auditados. A observação anterior sobre API_URL agora descreve um helper omitido da cópia; não foi necessário alterar .env.example nem executar importação.

### Nova leitura do dossiê portátil

O dossiê portátil foi novamente lido integralmente com os padrões de segredo/PII/referências internas e a regra ampliada de caminhos pessoais: **106.187 bytes**, SHA-256 **521d98ad89d4eb5b7bcbf9695c67f450a51669cf43490633b3a4a8f4ed7858bc**, sem achados nos padrões executados. Esse registro é da versão efetivamente lida nesta etapa; os hashes anteriores continuam como histórico de versões, não como atestado da versão atual.

Os recibos funcionais acrescentados pelo integrador não foram executados por esta frente. O guard literal e os hashes da seleção final devem ser conferidos pelo publicador antes do upload, incluindo qualquer modificação posterior de documentos. Esta auditoria não criou objeto ou ref no GitHub, não iniciou deploy/serviço e não editou produto, Git, credenciais ou Gastro.

**Conclusão de conteúdo para a seleção corrigida: PASS COM LIMITES.** Permanecem as advertências de licença/procedência, a fronteira de não transportar história local e a separação entre upload, testes e homologação visual.
