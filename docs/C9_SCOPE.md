# C9 — correções locais de editor, Hoje e superfícies legadas

Entrada preservada: árvore C8B `1e5e52c4f22cfee319fd539d2fab16d6fdb7d58e`, commit de proveniência declarado `b82b775750a72e6a168368a936ba7af1b8480661`. Commit local de preservação `18ce5af9a420448f6059930a4a632cfe8192a47c`; não reconstrói os pais do commit original. Branch local isolada `lab/hotel-c8b-local-20261024`, sem remoto/push. A Commander confirmou exclusividade desta cópia e autorizou correções locais. Não há outro agente escritor; consulta de processos vinculados ao caminho retornou zero antes da alteração.

## Alterações

- Título existente passa pelo editor, buffer local, comparação, ação, domínio, revisão, persistência e export. Vazio/branco, mais de 240 caracteres e alegações proibidas são recusados. Revisão nova inclui `exact_title`; título alterado invalida a revisão anterior. Buffer de título digitado durante resposta tardia permanece local. O título remoto não é aplicado sem decisão explícita.
- Migração **nova** `MIGRATION_C9_EDITORIAL_FIELDS_NOT_APPLIED.sql`, posterior a C8B, redefine somente as duas RPCs editoriais. Preserva guards owner/status, locks, CAS, SECURITY INVOKER e search_path. Não altera roles, grants, policies, triggers ou configurações de segurança. Novas confirmações SQL exigem exact_title correspondente. Exports legados sem exact_title continuam com as validações anteriores; qualquer nova edição confirmada deve portar o campo. Nenhum SQL histórico foi editado e nenhum banco real foi tocado.
- Hoje recupera a janela persistida que contém a data atual e seleciona o cartão correspondente. A criação de janela continua explícita; âncoras explicitamente consultadas não são substituídas por essa recuperação.
- A alternativa é prévia factual de modelo elegível, mesma data relevante, esforço estritamente menor, sem substituir a edição humana. Se não existe menor esforço elegível, a UI informa isso; não inventa sugestão. A prévia não é exportação aprovada nem altera rascunho/SQL.
- Dashboard reaproveita layout/navegação do app e lê o planejamento real pelo adapter existente. Foram retirados score, progresso 35%, post aleatório legado e campanha de Páscoa automaticamente apresentados como situação atual. Contagens exibidas vêm dos rascunhos lidos; falha de leitura é explícita.
- Campanhas estáticas permanecem referências históricas datadas, sem desconto, preço, pacote, amenidade ou resultado presumido. Data passada não vira HOJE. Registro estático só confirma após checar erro do armazenamento.
- Gerador não inventa 1.000 hooks. As ações de cópia no gerador, biblioteca, benchmarks e hashtags aguardam o clipboard antes de anunciar sucesso e mostram falha. Hashtags não promete +35% nem alcance estimado fictício; exemplos continuam identificados como exemplos.

## Limites preservados

C9 não prova login/Auth/JWT/SSR/PostgREST, grants instalados, restauração de banco do produto ou jornada integrada. O LAB auxiliar continua JSON e declara sua separação do Next/Supabase. Não houve criação de ambiente remoto ou credencial operacional. Modelos textuais não equivalem a corpus editorial homologado nem direitos de mídia. Referências externas de acervo continuam exigindo revisão antes do uso; não há homologação de seu conteúdo por esta correção.

A matriz dos dez critérios originais permanece obrigatória. Regressões, revisão independente, SQL descartável e capturas atuais devem ser associadas ao commit C9 efetivamente testado no recibo externo da tarefa. Resultados C8B não são reetiquetados como C9.

## Revisão C9.1

Prévia de alternativa é limpa antes de comparação/reconsulta e em erro; sua renderização também exige currentDraft com o perfil atualmente lido. Isso impede manter prévia com fatos revogados após atualizar o perfil. Nova regressão cobre a invalidação factual e o ponto de descarte na UI. Calendário sazonal legado preserva datas/temas e navegação, substituindo promessas de demanda, amenidades, pacotes e garantias sem fatos por instruções condicionadas à verificação. Não equivale a revisão editorial final desse acervo.

## Revisão C9.2

Limite de título alinhado: até240pontos de código Unicode, incluindo espaços na contagem; conteúdo só de whitespace é inválido. SQL usa length(title) bruto para limite e trim só para vazio; domínio usa Array.from(title).length. Removido maxlength nativo que contava unidadesUTF16 de modo diferente. Testes incluem241caracteres com padding e240/241símbolosUnicode.

SQL btrim usa a lista explícita de whitespace/line terminators do String.trim JavaScript, incluindoTAB, LF, NBSP eBOM; o tamanho continua bruto. Não aceita título invisível só de brancosUnicode.

## Revisão C9.3

Resposta de alternativa inclui o próprio perfil atualizado usado para calculá-la. Cliente adota perfil+prévia da mesma resposta, invalida aprovação/manual antigos e mantém a edição humana. Assim, DNA alterado externamente não oculta silenciosamente uma prévia nova contra o perfil local antigo. A guarda factual de renderização permanece. Teste da ação com IO sintético reproduz perfil externo novo e confere identidade DNA comum.
