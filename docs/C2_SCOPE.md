# C2: fronteiras da aplicação e SQL candidato recompostos

Incremento parcial, não final: configuração explícita nos quatro entrypoints, sessão/owner confiáveis no servidor, admin separado, ausência/erro de DNA, ações server-side e proposta SQL transacional/versionada.

A nova suíte executa o código das ações da aplicação transpilado sem mudanças, com somente IO sintético injetado. Isso não é teste de serviço externo ou Supabase real. Fatos atuais, revisão, confirmação exata, escopo e suspensão são verificados nas portas de export/edição.

SQL segue NOT_APPLIED; não houve parser/execução PostgreSQL, schema, grants ou RLS reais. O candidato grava os campos legados de hotéis, usa categoria perfil e mapeia stories/reels explicitamente. A existência de policies candidatas não prova que policies antigas/permissões sejam seguras.

As telas de onboarding e Hoje ainda serão ligadas a essas ações no próximo incremento. Não executar a jornada legada em serviço real. O gate de configuração não ativa LAB por ausência de credenciais. Nenhum serviço real foi usado.

C2.1 corrige a inferência TypeScript das linhas JSON sem schema gerado: o primeiro typecheck de C2 falhou em quatro acessos inferidos como never. O log original é preservado; novo typecheck PASS consta em typecheck-fixed.log. Nenhum schema aplicado foi presumido.
