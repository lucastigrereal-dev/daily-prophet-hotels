# C5 · correção do cliente LAB após crítica C4

C4 permanece preservada e REQUEST_CHANGES. C5 é incremento distinto da NOVA CANDIDATA RECOMPOSTA, mesmo writer/branch/baseline. Não altera domínio, ações do app, SQL ou adapter LAB; atua somente nos handlers do browser LAB e seus testes/documentos.

## C4-P1-01

Campos continuam editáveis durante a espera. Cada envio captura proprietário/contexto/draft, geração da intenção, revisão, texto e confirmação. A requisição é imutável; o servidor pode ter salvo a intenção enviada. A resposta só limpa buffer/aplica leitura fresca se ainda corresponder à intenção atual. Caso haja texto, ficha ou checkbox posterior, preserva bytes, buffer e revisão esperada locais; mostra a versão recebida como remota para decisão explícita. Não trata o texto posterior como salvo/revisado. Troca de draft invalida a aplicação da resposta velha. Leitura/comparação não restaura uma cópia anterior ao await. Mudança efetiva de DNA invalida o checkbox sem substituir o texto humano.

Exportação tardia também não reabre painel, copia ou registra uma revisão anterior se a intenção já mudou antes da resposta. Os argumentos de histórico ficam vinculados à revisão enviada, não a variáveis globais mutáveis. Se clipboard já concluiu antes de uma edição posterior, isso não é desfeito; não se presume que a nova edição tenha sido exportada.

## C4-P2-02

Troca A/B e estado sem draft limpam painel/conteúdo/argumentos de exportação, remoto, revisão, checkbox e metadados dependentes. Buffers de A permanecem somente sob chave de A e podem ser restaurados em B→A sem painel/export/review antigo.

## RED/GREEN e cobertura

Novo tests/lab-client.test.mjs executa client.js sem modificá-lo, DOM mínimo e IO do adapter sintético. RED inicial: 7/7 falhas reproduzindo perda/contexto; RED adicionais: mudança de DNA com checkbox em trânsito e retirada de aprovação ainda não salva após reaplicação. GREEN: 12/12, incluindo sucesso, falha, conflito, reaplicação explícita e exportação apenas após novo aceite exato da revisão mais recente. O primeiro agregado falhou apenas na asserção estática antiga de assinatura de api(export,args), agora ampliada para exigir proprietário capturado; log original preservado.

Nenhum teste de DOM mínimo é prova de browser/visual/clipboard reais. QA visual segue posterior ao novo congelamento. SQL NOT_APPLIED e PostgreSQL/auth/RLS/grants reais NOT_RUN. Sem push, merge, deploy, serviço real, credencial ou gasto.

Agregado final desta candidata C5: 89/89 testes PASS, zero falha/skip; build e typecheck PASS. Os 12 controles do cliente usam o arquivo real com DOM/IO sintéticos, não browser. Domínio/app/SQL/adapter permanecem byte a byte iguais a C4.
