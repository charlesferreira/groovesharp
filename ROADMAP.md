# GrooveSharp — Roadmap

Companheiro de prática pra músico: acompanhe a "saúde" de cada música do seu
setlist, saiba o que treinar e chegue no ponto pro show.

O projeto começou como um protótipo de arquivo único (em [`legacy/`](legacy/)) e
está sendo migrado para uma aplicação React de verdade — componentizada, testada,
instalável no celular (PWA) e publicada no GitHub Pages.

## Stack

- **React + TypeScript + Vite**
- **Vitest + Testing Library** para testes
- **vite-plugin-pwa** para app instalável / offline
- **GitHub Pages** (deploy via GitHub Actions)
- Dados no `localStorage` do aparelho (sem backend); export/import para backup

## Fases

- [x] **F0 — Fundação**: migrar o protótipo para React/TS com paridade de
  funcionalidades (lista, saúde por música, avaliação, ordenação, busca, escala
  de tempo, simulação, painel de opções). Testes da lógica de saúde.
- [x] **F1 — Biblioteca editável + vários setlists**: criar/renomear/excluir
  setlists; adicionar/editar/remover músicas pela interface. Migração dos dados
  do protótipo. (Estado num reducer testado; seletor de setlist + modo edição.)
- [x] **F2 — Dados por música**: tom, BPM, afinação/capo, anotações e vários
  links (Songsterr, YouTube, cifra). Tela/painel de detalhe da música.
- [x] **F3 — Prontidão pro show**: data do próximo show, contagem regressiva,
  score de prontidão e plano de treino (o que priorizar a cada dia).
- [x] **F4 — Modo palco**: tela cheia pro show (ordem, avançar músicas, tempo
  total, info da música, autoscroll).
- [x] **F5 — PWA + deploy**: manifest, ícones, offline; publicado no GitHub Pages
  em https://charlesferreira.github.io/groovesharp/ (deploy automático via Actions).
- [x] **F6 — Backup**: export/import dos dados (JSON) para não perder nada e
  passar entre dispositivos.

## Épico: backend + bandas (em andamento, branch `feat/bands`)

Ver [ADR 0001](docs/adr/0001-backend-e-bandas.md) e [setup](docs/SUPABASE_SETUP.md).

- [x] **B0 — Fundação do backend**: schema + RLS no Supabase (bandas, membros,
  convites, repertório, prática por usuário), validado de ponta a ponta.
- [x] **B1 — Casca + login**: abas (Praticar/Banda/Perfil), login opcional
  (Google/e-mail); modo local preservado quando sem backend.
- [x] **B2 — Dados na nuvem**: camada de repositório, prática por usuário, realtime,
  updates otimistas/offline; migração dos dados locais no primeiro login.
- [ ] **B3 — Bandas**: criar/entrar (convite), repertório compartilhado, membros,
  papéis, instrumentos.
- [ ] **B4 — Social**: heatmap da banda, prontidão coletiva pro show, feed de atividade.
- [ ] **Provisionar nuvem**: criar projeto Supabase, OAuth do Google, variáveis no deploy.

## Ideias futuras (além do mês)

- Histórico de treinos / heatmap de calendário / streaks.
- Metrônomo, afinador, playback e tablatura integrada.
