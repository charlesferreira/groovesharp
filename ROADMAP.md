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
- [ ] **F4 — Modo palco**: tela cheia pro show (ordem, avançar músicas, tempo
  total, info da música, autoscroll).
- [x] **F5 — PWA + deploy**: manifest, ícones, offline; publicado no GitHub Pages
  em https://charlesferreira.github.io/groovesharp/ (deploy automático via Actions).
- [ ] **F6 — Backup**: export/import dos dados (JSON) para não perder nada e
  passar entre dispositivos.

## Ideias futuras (além do mês)

- Sincronização real entre dispositivos (exigiria backend).
- Histórico de treinos / heatmap de calendário / streaks.
- Metrônomo e afinador embutidos.
- Compartilhar setlist com a banda.
