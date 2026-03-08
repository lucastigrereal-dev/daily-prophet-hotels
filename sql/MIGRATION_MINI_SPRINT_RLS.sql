-- ============================================================
-- MINI-SPRINT: RLS policies faltantes
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. hotel_missao_tarefas — policy para owner ver/editar tarefas das missoes do seu hotel
ALTER TABLE hotel_missao_tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hotel_missao_tarefas_owner" ON hotel_missao_tarefas
  FOR ALL USING (
    missao_id IN (
      SELECT hm.id FROM hotel_missoes hm
      JOIN hotels h ON h.id = hm.hotel_id
      WHERE h.owner_id = auth.uid()
    )
  );

-- 2. campanhas — tabela global (seed), qualquer user autenticado pode ler
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campanhas_select_authenticated" ON campanhas
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. playbooks — tabela global (seed), qualquer user autenticado pode ler
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playbooks_select_authenticated" ON playbooks
  FOR SELECT USING (auth.role() = 'authenticated');
