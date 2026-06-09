# PROMPT_02_PATCH — COMPLETAR FRONTEND DAILY PROPHET HOTELS

## CONTEXTO
Você está trabalhando no projeto `C:\Users\lucas\daily-prophet-hotels\`.
É um app Next.js 16.1.1 já deployado no Vercel com Supabase Auth funcionando.
O app já tem: Login, Register, Dashboard, Hotéis, Collabs, Onboarding (410 linhas, 7 steps).
FALTAM: 5 páginas core (Gerador, Benchmarks, Calendário, Analytics, Calendario Hotel) + migração para light theme.

## MISSÃO
1. Migrar TODO o app de dark theme para LIGHT THEME premium
2. Criar as 5 páginas que estão com pastas vazias
3. Manter TUDO que já funciona (Auth, Onboarding, Collabs, etc)
4. NÃO criar tabelas no Supabase (já existem)
5. NÃO instalar novas dependências (já tem tudo: framer-motion, sonner, react-hook-form, zod)

## SUPABASE — DADOS REAIS NO BANCO
- URL: process.env.NEXT_PUBLIC_SUPABASE_URL (já configurado)
- KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY (já configurado)
- Client: `import { createClient } from '@/lib/supabase/client'` (já existe)

### Tabelas com dados:
```
benchmarks_posts: 2.210 rows — legendas reais de hotéis
  Colunas: id, biblioteca_origem, numero_legenda, formato (foto/carrossel/reel), 
  publico (misto/casal/familia/corporativo/solo), intencao, tema, hook, 
  legenda_completa, cta, hashtags (text[]), qualidade_score (1-10), ativo, created_at
  Temas (26): all_inclusive, aventura, bastidores, cafe_da_manha, casamento, checkin, 
  corporativo, datas_comemorativas, destino, experiencias, familia, fazenda, gastronomia, 
  noite, pet_friendly, piscina, por_do_sol, praia, promocoes, quarto, romantico, serra, 
  spa, sustentabilidade, ugc, workation

hooks: 1.000 rows — hooks para posts
  Colunas: id, texto, publico, intencao, tema, formato, created_at

caption_templates: 8 rows — templates de legenda
  Colunas: id, nome, descricao, estrutura, objetivo, created_at

hashtag_combos: 6 rows — combinações de hashtags
  Colunas: id, nome, hashtags (text[]), publico, alcance_estimado, created_at

portfolio_profiles: 6 rows — perfis Instagram do portfolio
  Colunas: id, handle, nome, seguidores, nicho, cor_tema, descricao, quando_usar, created_at

hotels: 0 rows (populado via onboarding)
calendarios_gerados: 0 rows (populado ao criar posts)
```

## DESIGN SYSTEM — LIGHT THEME PREMIUM

### Filosofia
SaaS premium para hoteleiros. Referências: Notion + Linear + Stripe Dashboard.
Clean, confiável, profissional. Dourado como accent de autoridade.

### CSS Variables (adicionar em globals.css)
```css
:root {
  --bg-primary: #FAFBFC;
  --bg-card: #FFFFFF;
  --bg-sidebar: #F8F9FB;
  --bg-hover: #F3F4F6;
  --text-primary: #1A1D26;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --accent: #B8860B;
  --accent-light: #DAA520;
  --accent-bg: #FFF8E7;
  --border: #E5E7EB;
  --border-hover: #D1D5DB;
  --success: #059669;
  --warning: #D97706;
  --danger: #DC2626;
  --info: #2563EB;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

### Fonte
Trocar Geist por Plus Jakarta Sans (Google Fonts). Em app/layout.tsx:
```tsx
import { Plus_Jakarta_Sans } from 'next/font/google'
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
```

### Regras visuais absolutas
- Fundo geral: var(--bg-primary) #FAFBFC
- Cards: bg branco, border 1px var(--border), border-radius 16px, shadow-sm, hover shadow-md + translateY(-1px)
- Botão primário: bg var(--accent) #B8860B, text white, font-semibold, radius 10px, hover brightness(1.1)
- Badges/Pills: bg suave da cor + text da cor, radius 20px, font-size 12px
- Sidebar: bg var(--bg-sidebar), border-right 1px var(--border), width 260px
- Inputs: height 44px, bg white, border 1px var(--border), radius 8px, focus ring 2px var(--accent-light)
- Stats Cards: número grande font-size 28px font-weight 700 + label pequeno text-secondary
- ZERO dark backgrounds. Tudo claro.

---

## TAREFA 1: MIGRAR PARA LIGHT THEME

### 1.1 app/layout.tsx
- Trocar fonte de Geist para Plus_Jakarta_Sans
- Trocar `bg-[#0a0a0a] text-white` por `bg-[#FAFBFC] text-[#1A1D26]`
- Trocar themeColor de "#0a0a0a" para "#FAFBFC"
- Atualizar Toaster: theme="light", style com bg branco

### 1.2 app/globals.css
- Adicionar as CSS variables acima
- Corpo: background var(--bg-primary), color var(--text-primary)

### 1.3-1.13 TODOS OS ARQUIVOS EXISTENTES
Aplicar substituição de cores em TODOS os arquivos .tsx:

PADRÃO DE SUBSTITUIÇÃO GLOBAL:
```
bg-[#0a0a0a] → bg-[#FAFBFC]
bg-zinc-900 → bg-white
bg-zinc-800 → bg-[#F3F4F6]
border-zinc-800 → border-[#E5E7EB]
border-zinc-700 → border-[#D1D5DB]
text-white → text-[#1A1D26]
text-zinc-400 → text-[#6B7280]
text-zinc-500 → text-[#9CA3AF]
text-zinc-300 → text-[#374151]
text-amber-500 → text-[#B8860B]
text-amber-400 → text-[#DAA520]
bg-amber-500 → bg-[#B8860B]
hover:bg-amber-400 → hover:bg-[#DAA520]
bg-amber-500/10 → bg-[#FFF8E7]
bg-amber-500/20 → bg-[#FFF8E7]
text-green-400 → text-emerald-700
bg-green-500/10 → bg-emerald-50
text-red-400 → text-red-600
bg-red-500/10 → bg-red-50
text-blue-400 → text-blue-700
bg-blue-500/10 → bg-blue-50
hover:bg-zinc-800 → hover:bg-[#F3F4F6]
hover:bg-zinc-700 → hover:bg-[#E5E7EB]
hover:border-zinc-700 → hover:border-[#D1D5DB]
focus:ring-amber-500/50 → focus:ring-[#DAA520]/40
focus:border-amber-500 → focus:border-[#B8860B]
placeholder-zinc-500 → placeholder-[#9CA3AF]
bg-black/60 → bg-black/20
disabled:bg-zinc-700 → disabled:bg-[#E5E7EB]
disabled:text-zinc-500 → disabled:text-[#9CA3AF]
border-amber-500 → border-[#B8860B]
border-t-transparent → border-t-transparent
bg-zinc-900/80 → bg-white/80
```

Arquivos a migrar: Sidebar.tsx, Header.tsx, MobileNav.tsx, SidebarContext.tsx, 
dashboard/page.tsx, dashboard/layout.tsx, hoteis/page.tsx, hoteis/[hotelId]/page.tsx, 
collabs/page.tsx, onboarding/page.tsx, auth/login/page.tsx, auth/register/page.tsx, 
auth/layout.tsx, admin/page.tsx, admin/layout.tsx, todos components/ui/*.tsx

Nos cards, adicionar: `shadow-sm hover:shadow-md transition-all duration-200`

---

## TAREFA 2: CRIAR 5 PÁGINAS NOVAS

### 2.1 app/dashboard/gerador/page.tsx — GERADOR DE LEGENDAS

Página principal do produto. Busca e filtra as 2.210 legendas do banco.

**Layout:**
- Topo: título "Gerador de Legendas" + badge "2.210 legendas"
- Painel de filtros (collapsible no mobile)
- Grid de resultados com paginação
- Tabs: "Legendas" | "Templates (8)" | "Hooks (1.000)"

**Filtros:**
- Tema: select com 26 opções (all_inclusive, aventura, bastidores, cafe_da_manha, casamento, checkin, corporativo, datas_comemorativas, destino, experiencias, familia, fazenda, gastronomia, noite, pet_friendly, piscina, por_do_sol, praia, promocoes, quarto, romantico, serra, spa, sustentabilidade, ugc, workation)
- Público: pills (misto, casal, familia, corporativo, solo)
- Formato: pills (foto, carrossel, reel)
- Intenção: text input
- Busca texto: input que filtra por legenda_completa (ilike)
- Qualidade mínima: range slider 1-10

**Query Supabase (legendas):**
```ts
let query = supabase.from('benchmarks_posts').select('*', { count: 'exact' })
  .eq('ativo', true)
if (tema) query = query.eq('tema', tema)
if (publico) query = query.eq('publico', publico)
if (formato) query = query.eq('formato', formato)
if (intencao) query = query.ilike('intencao', `%${intencao}%`)
if (busca) query = query.ilike('legenda_completa', `%${busca}%`)
if (qualidadeMin > 1) query = query.gte('qualidade_score', qualidadeMin)
query = query.order('qualidade_score', { ascending: false }).range(page * 20, (page + 1) * 20 - 1)
```

**Card de legenda:**
- Badge tema (cor suave) + badge formato + badge público
- Hook em destaque (text-lg font-semibold)
- Legenda completa (max 3 linhas, expandir ao clicar)
- CTA em destaque
- Hashtags como pills pequenas
- Qualidade score como barra visual (1-10)
- Botão "Copiar" (navigator.clipboard.writeText) que copia legenda_completa + hashtags.join(' ')

**Tab Templates:**
```ts
const { data } = await supabase.from('caption_templates').select('*')
```
Grid de 8 cards: nome, objetivo, descrição, estrutura

**Tab Hooks:**
```ts
let query = supabase.from('hooks').select('*', { count: 'exact' })
if (tema) query = query.eq('tema', tema)
if (publico) query = query.eq('publico', publico)
query = query.range(page * 50, (page + 1) * 50 - 1)
```
Lista de hooks com botão copiar. Paginação 50/página.

### 2.2 app/dashboard/benchmarks/page.tsx — BIBLIOTECA DE BENCHMARKS

**Layout:**
- Topo: "Biblioteca de Benchmarks" + stats (total, média qualidade)
- Grid de stats por tema: 26 cards mostrando quantidade por tema
- Filtros + Tabela/Grid com legendas

**Stats por tema:**
Buscar todos, agrupar client-side. Card por tema com count + qualidade média.

### 2.3 app/dashboard/calendario/page.tsx — CALENDÁRIO EDITORIAL

Grid visual de calendário mensal.
- Header: navegação mês (← Fevereiro 2026 →) + botão "Criar Post"
- Grid 7 colunas (Dom Seg Ter Qua Qui Sex Sab)
- Cada dia com posts = bolinha colorida (foto blue, carrossel green, reel purple)
- Click dia → modal posts
- Modal "Criar Post": form com data, tema, formato, público, legenda, hashtags, status
- INSERT em calendarios_gerados com hotel_id se aplicável

**Query:**
```ts
const firstDay = new Date(year, month, 1).toISOString()
const lastDay = new Date(year, month + 1, 0).toISOString()
const { data: posts } = await supabase.from('calendarios_gerados').select('*')
  .gte('data_post', firstDay).lte('data_post', lastDay).order('data_post')
```

### 2.4 app/dashboard/analytics/page.tsx — ANALYTICS

- Stats cards: total legendas, hooks, templates, hotéis
- Barras horizontais CSS puras por tema, formato, público
- NÃO instalar chart library

### 2.5 app/dashboard/hoteis/[hotelId]/calendario/page.tsx

Igual calendário geral, filtrado por hotel_id do param.

---

## TAREFA 3: ATUALIZAR DASHBOARD

Stats reais do banco:
```ts
const { count: totalLegendas } = await supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true })
const { count: totalHooks } = await supabase.from('hooks').select('*', { count: 'exact', head: true })
const { count: totalTemplates } = await supabase.from('caption_templates').select('*', { count: 'exact', head: true })
```

Portfolio dinâmico:
```ts
const { data: perfis } = await supabase.from('portfolio_profiles').select('*').order('seguidores', { ascending: false })
```
Mostrar soma total seguidores.

Adicionar "Ações Rápidas": 3 cards link para Gerador, Calendário, Onboarding.

## TAREFA 4: ATUALIZAR SIDEBAR

Ordem: Dashboard, Hotéis, Gerador IA, Benchmarks, Calendário, Analytics, Collabs, Admin

---

## REGRAS ABSOLUTAS

1. NÃO criar tabelas no Supabase
2. NÃO instalar novas dependências
3. NÃO usar mock data — TUDO do Supabase real
4. NÃO deletar/reescrever Onboarding, Login, Register, Collabs — só trocar cores
5. NÃO dark theme em NENHUM lugar
6. SIM usar createClient de @/lib/supabase/client
7. SIM manter Supabase Auth
8. SIM usar sonner para toasts
9. SIM mobile-first responsivo
10. SIM todos os textos em português

## CHECKLIST

- [ ] npm run dev sem erros
- [ ] /auth/login funciona → /dashboard
- [ ] /dashboard stats reais (2.210, 1.000, 8)
- [ ] /dashboard portfolio de portfolio_profiles
- [ ] /dashboard/gerador filtra legendas
- [ ] /dashboard/gerador tabs Templates e Hooks
- [ ] /dashboard/gerador Copiar funciona
- [ ] /dashboard/benchmarks distribuição por tema
- [ ] /dashboard/calendario grid mensal
- [ ] /dashboard/calendario criar post
- [ ] /dashboard/analytics métricas
- [ ] /dashboard/hoteis/[id]/calendario funciona
- [ ] Sidebar 8 items ordem certa
- [ ] ZERO dark classes (bg-zinc-900, bg-[#0a0a0a])
- [ ] Plus Jakarta Sans carregando
- [ ] Responsivo mobile
- [ ] Zero erros TypeScript