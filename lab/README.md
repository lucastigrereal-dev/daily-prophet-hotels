# Hotel Pro · LAB sintético recomposto

Separado do aplicativo operacional Next/Supabase. Compartilha somente o domínio puro e o catálogo textual aprovado para revisão. Não é autenticação, RLS, migração, serviço real, publicação, reserva ou evidência de receita. A/B e todos os fatos são fictícios; relógio injetado fixo em 2026-10-23. Não há credenciais, chamadas externas nem gastos.

## Iniciar explicitamente

Node 24 disponível neste checkout. No terminal nativo da máquina cloud que será usada pelo browser:

```sh
cd /workspace/shared/hotel-recomposed-candidate
HOTEL_MODE=lab HOTEL_LAB_STATE=/tmp/hotel-recomposed-lab-qa.json PORT=4177 node lab/server.mjs
```

Abrir http://127.0.0.1:4177 no browser da mesma máquina. Não presume que servidor iniciado em um exec isolado fique acessível no browser cloud. Sem HOTEL_MODE=lab o processo falha; configuração Supabase ausente nunca liga o LAB. O arquivo JSON é exclusivamente estado sintético, preservado por rename atômico; escolher outro caminho cria outro cenário sem apagar dados. Ctrl+C encerra; repetir com o mesmo arquivo permite demonstrar retomada. Não expor bind a interfaces públicas nem usar dados reais.

## Jornada mínima para QA

1. A: revisar a ficha JSON fictícia e salvar módulos 1, 2, 3 e 4. Cada etapa espera recibo. Em módulo 4, injetar after_profile e verificar falha/nenhum avanço; retirar falha e repetir a mesma tentativa. after_commit demonstra resposta incerta: repetir idêntico recupera recibo sem duplicar evento.
2. Criar janela: sete datas/modelos distintos; com cadência 3 são três sugestões e quatro preparações. Texto só como rascunho. B não tem a janela A. Não é prova de isolamento por autenticação real.
3. Editar, marcar revisão exata e salvar. Copiar obtém primeiro texto verificado no domínio; só registra EXPORTED após a cópia. Alternativa manual fica disponível quando clipboard é negado. Registrar manual é uma declaração do operador, não prova técnica do clipboard. Nenhuma publicação.
4. Em duas abas A, salvar versões concorrentes. Comparar remoto não troca o textarea local. Escolher explicitamente manter/mesclar sobre revisão remota ou descartar local. Reaplicar ainda exige novo save/review. Buffer por ator/hotel/draft no sessionStorage.
5. Reabrir quatro módulos, alterar fato, confirmar nova versão. Texto antigo preservado, exportação bloqueada até reparo e revisão exata. Revogar todos os fatos nega getExport e recordExport pelo mesmo domínio do app. DNA ausente conserva janela e edição não aprovada, não aprovação/exportação.
6. Suspender: histórico legível, saves/onboarding/plano/export bloqueados. Restaurar ativo é controle explícito fictício apenas deste LAB, não administrador do produto.
7. Encerrar e reiniciar com mesmo arquivo: revisão, janela, edição e histórico permanecem. HTTP/testes demonstram esse fluxo. Browser/mobile/clipboard reais requerem QA visual separada; não marcados PASS por testes HTTP.

Ações de cenário e fault injection existem somente no LAB, não no adapter Supabase. O SQL da aplicação permanece NOT_APPLIED; parser/execução PostgreSQL, auth/RLS/grants/status/owner reais são NOT_RUN.

## C5 · edição durante resposta pendente

Os campos continuam editáveis. Se digitar outra intenção enquanto um save/compare/export aguarda resposta, o texto/ficha/buffer mais novo não é trocado pela resposta antiga. A revisão enviada pode ter sido salva; ela aparece como remota, enquanto a edição local continua na revisão esperada anterior. Compare e clique manter/mesclar para adotar explicitamente a revisão remota antes do próximo save. Refaça o aceite exato depois de editar ou quando o DNA mudar. Trocar A/B limpa painéis de exportação e comparação; voltar a A recupera só o buffer A, sem revisão/exportação anterior promovidas como atuais.
