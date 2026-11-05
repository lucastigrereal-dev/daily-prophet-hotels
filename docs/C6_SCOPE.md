# C6 · fechamento mínimo do P2 de reconfirmação C5

C5, seu commit/checkpoint e evidências permanecem preservados. Este incremento muda somente o cliente LAB e testes/documentação. Domínio, app, contrato HTTP, SQL e adapter não mudam.

C5-P2-01 reproduzido antes da correção: após quatro módulos normais com draft selecionado, servidor r8 completo e cliente ainda m4/r7, acusando digitação inexistente. RED: 14/15 PASS, uma falha esperada.

O cliente separa invalidação editorial da geração de intenção humana. Só a leitura correspondente ao recibo próprio exato (hotel, conclusão/módulo, revisão, ficha enviada e identidade do DNA) pode invalidar o aceite do post sem criar uma intenção digitada. Essa leitura permite concluir a própria reconfirmação em r8 uma única vez. Texto/draft antigo permanecem preservados e não ganham aprovação pelo novo DNA. Leitura externa/inesperada ou digitação posterior continua exigindo comparação.

GREEN: 15/15 controles do cliente, incluindo reconfirmação normal sem retry, nova ficha digitada durante módulo4 e DNA externo r9 após o commit próprio r8. Agregado final: 92/92 PASS, zero falha/skip; build e typecheck PASS no mesmo checkout. Os testes de cliente usam client.js real com DOM/IO sintéticos, não browser real.

Não há mudança de contrato ou risco operacional novo. SQL NOT_APPLIED; PostgreSQL/auth/RLS/grants reais NOT_RUN. Visual/clipboard reais permanecem para smoke coordenado e revisão independente focada. Sem push, merge, deploy, serviços reais, credenciais ou gasto.
