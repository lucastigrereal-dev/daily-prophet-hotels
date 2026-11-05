# C3: UI integrada e correções da crítica C2.1

NOVA CANDIDATA RECOMPOSTA, não recuperação da R2 perdida. Mesma baseline master; sem PR2/PR4 integral.

Onboarding reutiliza os quatro módulos com UF explícita, fatos, capacidade, reconfirmação de perfil concluído/legado e uma única operação aguardada antes de avançar. Buffer por ator, comparação remota sem apagar campos. Hoje usa sete rascunhos do caminho de calendário da aplicação (adapter não validado em serviço externo), política compartilhada, edição/revisão exata, buffer por ator/hotel/draft e conflito com decisão explícita. É reaproveitamento parcial da tela antiga, não promessa de preservar todos seus recursos. Calendário mensal reutilizado com SELECT/INSERT via owner no servidor e gravação somente como rascunho.

Crítica independente parcial C2.1 recebeu três correções novas. RED: 50 testes, 41 PASS/9 FAIL. GREEN inicial: 50/50. DNA ausente/malformado não oculta textos salvos e não impede edição não aprovada; nenhum perfil padrão. Falha de leitura continua erro explícito. Reparos exatos com expansão/caixa/Unicode/espaços são aceitos sem reescrita; ocorrência antiga independente continua negada. RPCs candidatas derivam o conjunto obrigatório do template/versão de lista versionada confiável, recusam {} e conjuntos parciais/extras, e nunca substituem proveniência em edição não aprovada.

SQL NOT_APPLIED. Testes SQL são estáticos/contratuais, não execução, parser PostgreSQL, RLS ou grants reais. A identidade/estado/owner das tabelas existentes continuam sujeitos ao gate de segurança pré-aplicação. A confirmação humana exata não é prova automática da verdade de texto livre. Serviços externos, autenticação real, migrações, banco, publicação e mídia reais não usados.

Build/typecheck executados neste produto/checkout; teste runtime local usa processo Next com configuração vazia e prova 503 explícito em três rotas. Isso não é jornada autenticada com backend. UI visual/mobile ainda NOT_RUN, para QA coordenada após congelamento. LAB separado ainda em construção neste checkpoint.
