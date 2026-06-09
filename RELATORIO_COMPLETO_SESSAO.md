# RELATÓRIO COMPLETO — DAILY PROPHET HOTELS
## Sessão de 26-27/Fev/2026

---

## 1. O QUE É O PROJETO

App para monetizar 6 perfis Instagram (2,42M seguidores, público família brasileiro) vendendo pacotes de marketing de conteúdo para hotéis brasileiros (R$1k-4k/mês).

**Perfis:**
- @lucastigrereal (690k)
- @oinatalrn (630k)
- @agenteviajabrasil (440k)
- @afamiliatigrereal (320k)
- @oquecomeremnatal (220k)
- @resolutes (120k)

**Fluxo:** Instagram → Publi → Sistema → Escala
Hotel paga → recebe calendário de posts + publi nos perfis + dashboard com métricas.

---

## 2. O QUE FOI CONSTRUÍDO NESTA SESSÃO

### 2.1 SUPABASE (Banco de Dados)
- **Projeto:** daily-prophet-hotels
- **ID:** qrcgedbuppodfbfqzocj
- **URL:** https://qrcgedbuppodfbfqzocj.supabase.co
- **Região:** sa-east-1 (São Paulo)
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyY2dlZGJ1cHBvZGZiZnF6b2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTc2NDMsImV4cCI6MjA4NzY3MzY0M30.1jtxXP08xVTQs6U5mf0RhXZZ3S7CY3WTh50Xdapf7pQ

#### 18 Tabelas criadas:
1. **users** — Multi-tenant (admin, comercial, hotel_owner, assistente)
2. **hotels** — Cadastro + CRM (nome, tipo, cidade, status, plano, valor)
3. **hotel_estruturas** — 70+ booleans (piscinas, alimentação, lazer, etc)
4. **hotel_publico** — Segmentação (famílias, casais, origem, motivação)
5. **hotel_digital** — Instagram, Facebook, TikTok, Google, Booking, OTAs
6. **hotel_posicionamento** — Como quer ser visto (luxo, família, aventura, etc)
7. **hotel_metas** — Objetivos e dores
8. **onboarding_respostas** — JSONB flexível + progresso
9. **hooks** — 1.000 hooks categorizados
10. **benchmarks_posts** — 2.080 legendas prontas (26 temas × 80)
11. **hashtag_combos** — Combos prontos por nicho
12. **caption_templates** — 8 frameworks de legenda (PAS, storytelling, etc)
13. **knowledge_base** — Guia operacional
14. **calendarios_gerados** — Posts gerados por hotel
15. **instagram_analysis** — Análise do perfil do hotel
16. **collabs** — Parcerias e pagamentos
17. **portfolio_profiles** — 6 perfis Instagram
18. **activity_log** — Auditoria

#### Dados populados:
| Tabela | Registros |
|--------|-----------|
| hooks | 1.000 |
| benchmarks_posts | 2.080 |
| caption_templates | 8 |
| hashtag_combos | 6 |
| portfolio_profiles | 6 |
| users | 1 (conta do Lucas) |
| **TOTAL** | **3.100** |

#### Infraestrutura DB:
- RLS (Row Level Security) ativo em todas as tabelas
- Trigger auto-create user on signup (auth.users → public.users)
- Trigger update_updated_at em hotels, hotel_digital, collabs
- Trigger check_onboarding_complete
- 3 Views: v_hotels_completo, v_collabs_ativas, v_calendario_mes
- Indexes em campos de busca/filtro

### 2.2 APP NEXT.JS
- **Pasta:** C:\Users\lucas\daily-prophet-hotels
- **Stack:** Next.js 16.1.1 + React 19 + TypeScript + Tailwind CSS 4
- **Auth:** @supabase/ssr (cookie-based, App Router)
- **UI:** Dark theme, amber accent, mobile-first
- **Build:** 100% limpo, zero erros TypeScript

#### Páginas criadas:

| Rota | Tipo | Descrição |
|------|------|-----------|
| / | Server | Redirect → /auth/login ou /dashboard |
| /auth/login | Client | Login email/senha |
| /auth/register | Client | Registro com nome |
| /auth/callback | API | OAuth code exchange |
| /onboarding | Client | 7 steps cadastro hotel (mobile-first) |
| /dashboard | Client | Home com stats + lista hotéis + portfolio |
| /dashboard/hoteis | Client | Lista hotéis com filtros por status |
| /dashboard/hoteis/[id] | Client | Detalhe hotel com stats |
| /dashboard/hoteis/[id]/calendario | Client | Posts do hotel (expandir, aprovar, copiar) |
| /dashboard/collabs | Client | Parcerias ativas + MRR |
| /admin | Client | Dashboard admin (todos hotéis, receita) |

#### Componentes criados:

| Componente | Descrição |
|-----------|-----------|
| Header.tsx | Hamburger mobile + logo + logout |
| Sidebar.tsx | Drawer mobile + sidebar fixa desktop |
| MobileNav.tsx | Bottom nav 5 items (mobile only) |
| SidebarContext.tsx | Context pra open/close sidebar |

#### Layout mobile-first:
- Bottom nav no mobile (lg:hidden)
- Sidebar drawer com overlay no mobile
- Sidebar fixa no desktop (lg:)
- Cards 1 coluna mobile, 2-4 colunas desktop
- Botões min 44px touch target
- pb-24 no main pra não esconder atrás do bottom nav

#### Onboarding 7 steps:
1. **Identificação** — Nome, tipo (pill selector), classificação, cidade, estado, quartos, diária
2. **Estrutura** — Checkboxes: piscinas(8), alimentação(6), infantil(4), bem-estar(6), localização(4), outros(4)
3. **Digital** — Instagram, seguidores, quem posta, site, Google, Booking, problema redes
4. **Público** — Checkboxes público(8), estação mais movimentada (pill)
5. **Posicionamento** — Checkboxes(8), concorrente, diferencial, momento UAU
6. **Metas** — Meta principal (pill), faixa investimento (pill), dor, expectativa
7. **Revisão** — Resumo de tudo, botão Finalizar

Salva em: hotels + hotel_estruturas + hotel_digital + hotel_publico + hotel_posicionamento + hotel_metas + onboarding_respostas (7 tabelas)

#### Dependências (package.json):
```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.90.1",
  "@hookform/resolvers": "^3.9.0",
  "framer-motion": "^12.23.26",
  "next": "16.1.1",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "react-hook-form": "^7.54.0",
  "sonner": "^1.7.0",
  "uuid": "^13.0.0",
  "zod": "^3.24.0"
}
```

### 2.3 GITHUB
- **Repo:** https://github.com/lucastigrereal-dev/daily-prophet-hotels
- **Branch:** master
- **Commit:** cb8c664 "Daily Prophet Hotels MVP - auth, onboarding, dashboard, admin, mobile-first"
- **Visibilidade:** private

### 2.4 ARQUIVOS EXISTENTES (APPHOTEL)
Pasta C:\Users\lucas\Desktop\ARQUIVOS-APPHOTEL contém:
- 75 arquivos soltos na raiz
- 3 projetos extraídos de ZIPs:
  - daily-prophet-hotels-sistema-completo/ (Next.js monolith, 45 files)
  - daily-prophet-hotels-v/ (FastAPI + Next.js, 40 files)
  - daily-prophet-hotels-v2.1-completo/ (Next.js monolith expandido, 45 files)

Arquivos chave já integrados no app:
- sql/SCHEMA_V2.sql → aplicado no Supabase
- sql/FUNCTIONS.sql → aplicado no Supabase
- sql/SCHEMA_V2_1_EXPANSION.sql → aplicado no Supabase
- lib/ai/context-builder.ts → copiado pro projeto
- 1000-hooks-hoteis.md → parseado e inserido (1.000 hooks)
- benchmarks-hoteis-brasil.md → parseado e inserido (2.080 legendas)

### 2.5 GAMIFIED (Projeto anterior reutilizado)
Pasta C:\Users\lucas\Desktop\APP_DAILY_PROPHET_PROKETO\daily-prophet-gamified
- Usado como base do projeto (copiado pra ~/daily-prophet-hotels)
- Componentes UI reutilizados: CopyButton, ItemSelector, ProgressBar, Skeleton, LoadingSpinner
- Estrutura de projeto, tsconfig, tailwind config
- Workflow antigo removido (app/workflow, components/workflow, etc)
- Vercel deploy existente: daily-prophet-gamified.vercel.app

---

## 3. O QUE FALTA

### 3.1 CRÍTICO (pra estar live)
- [ ] **Deploy na Vercel** — precisa rodar `npx vercel login` no terminal do Windows (PowerShell, não WSL). O Docker Desktop causa erro "Plan9 mount failed" — fechar Docker primeiro.
  ```
  cd C:\Users\lucas\daily-prophet-hotels
  npx vercel login
  npx vercel deploy --prod
  ```
  Env vars pra configurar:
  - NEXT_PUBLIC_SUPABASE_URL = https://qrcgedbuppodfbfqzocj.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY = (ver acima)

### 3.2 IMPORTANTE (melhorias)
- [ ] Página /dashboard/benchmarks — browser de legendas com filtros
- [ ] Página /dashboard/calendario — calendário global (não por hotel)
- [ ] Página /dashboard/gerador — gerador IA com Claude API (removido do MVP inicial, adicionar depois)
- [ ] Página /dashboard/analytics — métricas
- [ ] Página /admin/hoteis — pipeline kanban
- [ ] Página /admin/financeiro — receita detalhada
- [ ] CSV calendario_editorial_3meses.csv → importar pro banco
- [ ] Landing page pública (/) pra captar leads

### 3.3 FUTURO (Fase 2+)
- [ ] Gerador IA (Claude API) — gerar calendários automaticamente
- [ ] Integração Publer API — agendar posts no Instagram
- [ ] Stripe — pagamentos recorrentes
- [ ] OpenClaw — agentes comerciais automatizados
- [ ] Reports PDF — relatórios mensais pra hotéis
- [ ] Notificações Telegram

---

## 4. COMO RODAR LOCAL

```bash
cd C:\Users\lucas\daily-prophet-hotels
npm run dev
```
- PC: http://localhost:3000
- Celular (mesma rede): http://192.168.3.41:3000

Login: usar a conta já criada ou criar nova em /auth/register

---

## 5. ESTRUTURA DO PROJETO

```
daily-prophet-hotels/
├── .env.local              # Credenciais Supabase
├── package.json            # Next.js 16 + React 19
├── tsconfig.json           # TypeScript strict
├── next.config.ts          # Turbopack
├── middleware.ts            # Auth guard
├── sql/
│   ├── SCHEMA_V2.sql       # 18 tabelas
│   ├── FUNCTIONS.sql       # 8 RPCs
│   └── SCHEMA_V2_1_EXPANSION.sql
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (@supabase/ssr)
│   │   ├── server.ts       # Server client (@supabase/ssr)
│   │   └── middleware.ts   # Auth refresh
│   └── ai/
│       └── context-builder.ts  # Prompt builder pra IA
├── contexts/
│   └── SidebarContext.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Hamburger + logo + logout
│   │   ├── Sidebar.tsx     # Drawer mobile + fixed desktop
│   │   └── MobileNav.tsx   # Bottom nav mobile
│   └── ui/
│       ├── CopyButton.tsx
│       ├── ItemSelector.tsx
│       └── ProgressBar.tsx
├── app/
│   ├── layout.tsx          # Root + Toaster + viewport meta
│   ├── page.tsx            # Redirect auth/dashboard
│   ├── auth/
│   │   ├── layout.tsx      # Centered card
│   │   ├── login/page.tsx  # Email + senha
│   │   ├── register/page.tsx # Nome + email + senha
│   │   └── callback/route.ts
│   ├── onboarding/
│   │   ├── layout.tsx      # Clean layout sem sidebar
│   │   └── page.tsx        # 7 steps completos
│   ├── dashboard/
│   │   ├── layout.tsx      # Sidebar + Header + MobileNav
│   │   ├── page.tsx        # Stats + hotéis + portfolio
│   │   ├── collabs/page.tsx
│   │   └── hoteis/
│   │       ├── page.tsx    # Lista com filtros
│   │       └── [hotelId]/
│   │           ├── page.tsx      # Detalhe
│   │           └── calendario/page.tsx  # Posts
│   └── admin/
│       ├── layout.tsx
│       └── page.tsx        # Stats admin
└── types/
    ├── index.ts
    ├── hotel-types.ts      # 15 interfaces hotel
    ├── auth.ts
    ├── database.ts
    ├── postpack.ts
    └── ui.ts
```

---

## 6. DECISÕES TOMADAS

1. **Base:** Usamos daily-prophet-gamified como base (Next.js 16 + React 19) e trouxemos o schema/types/context-builder do v2.1
2. **Auth:** @supabase/ssr com cookies (não localStorage) — funciona em Server Components
3. **Mobile first:** Bottom nav + drawer sidebar + cards empilhados
4. **Sem IA no MVP:** Gerador Claude API removido — será adicionado depois
5. **Dark theme:** bg-[#0a0a0a] + zinc + amber accent
6. **Supabase novo:** Projeto "daily-prophet-hotels" criado (seogram-studio não restaurável por >90 dias pausado). Pausamos aprenda-rima pra liberar slot.

---

## 7. CONTAS E ACESSOS

| Serviço | Conta | Notas |
|---------|-------|-------|
| Supabase | lucastigrereal-dev | Org: gewwjytjzceybjtqmkny |
| Vercel | lucastigrereal-dev | Team: team_NwpKcQXuXJ9Guuriw88EIcAO |
| GitHub | lucastigrereal-dev | Repo: daily-prophet-hotels (private) |
| App auth | (conta criada na sessão) | Supabase Auth email/senha |

Projetos Supabase ativos: daily-prophet-hotels + akasha-hub (aprenda-rima pausado)
