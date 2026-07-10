# ADR 0001 — Backend, contas e bandas (workspaces)

**Status:** aceito · **Data:** 2026-07-06

## Contexto

O GrooveSharp hoje é 100% local (dados no `localStorage`, sem contas). Queremos:

- Contas com **login Google** (OAuth) e **sincronização entre dispositivos**.
- **Bandas como workspaces** (modelo Slack): membros, papéis, convites, instrumentos.
- **Repertório compartilhado** por banda, mas **prática/saúde pessoal** de cada membro.
- Camada social depois (heatmap, prontidão coletiva, feed) — sem poluir o loop pessoal.

## Decisão

### Plataforma: Supabase

Postgres gerenciado + Auth (Google) + **Row-Level Security (RLS)** + Realtime. O modelo
relacional casa com bandas ↔ membros ↔ músicas, e a RLS transforma "quem pode ver/editar
o quê" em regras no banco (fonte única de verdade de permissão).

### Princípio central do modelo de dados

> **Repertório é da banda; prática é da pessoa.**

Uma música existe uma vez no repertório da banda. A saúde/decaimento é calculada por
**(usuário, música)** — cada membro tem a própria prontidão sobre o mesmo repertório.
Isso destrava o social (heatmap, "quem travou o quê") sem duplicar dados.

### Modelo de dados (tabelas)

- `profiles` — espelho de `auth.users` (nome, avatar).
- `bands` — a banda/workspace.
- `band_members` — associação usuário↔banda: `role` (`admin`|`member`), `instruments[]`,
  `share_practice` (bool, controla visibilidade da prática pros colegas). PK composta.
- `band_invites` — convites por **link** (token, papel, validade). E-mail fica opcional.
- `songs` — **repertório da banda** (title, artist, duration, key, bpm, tuning, notes,
  `added_by`). Pertencem à banda, não ao setlist.
- `setlists` — listas ordenadas de um show/ocasião (`show_date`), pertencem à banda.
- `setlist_songs` — join ordenado `setlist ↔ song` (uma música pode estar em vários setlists).
- `practice_entries` — **por (usuário, música)**: `rating`, `last_practiced_at`.

### Permissões (RLS, resumo)

- Ser **membro** da banda dá acesso de leitura ao repertório/setlists/membros dela.
- **Membros** editam repertório e setlists; **admin** gerencia membros, convites e a banda.
- `practice_entries`: cada um lê/escreve a sua; colegas leem a dos outros **apenas** se
  `share_practice = true` (base do heatmap, respeitando privacidade).

### Estratégia local-first / sync

Não perder a sensação instantânea e offline do PWA:

- **Cache local** espelha o servidor; **escritas otimistas** (UI atualiza na hora, sincroniza
  em seguida); **Realtime** propaga mudanças dos colegas ao vivo.
- Sem conexão, o app funciona com o cache; ao voltar, reconcilia.
- Conflitos de repertório: last-write-wins por campo no v1 (simples); prática é por-usuário,
  então quase nunca conflita.

### Migração dos dados locais

No primeiro login, oferecer **importar** os setlists/prática locais atuais para uma banda
pessoal (ex.: "Meu repertório"), virando o dono. Nada é perdido.

### Processo / rollout

- Épico desenvolvido na branch `feat/bands`; a `main` (produção, PWA instalado) só recebe
  quando estável.
- Desenvolvimento e testes contra **Supabase local** (Docker); nuvem só no fim.
- O que **exige o Charles**: criar o projeto Supabase na nuvem, configurar o OAuth do Google
  e apontar as variáveis de ambiente. Documentado em `docs/SUPABASE_SETUP.md`.

## Alternativas consideradas

- **Firebase**: Auth + NoSQL + Realtime, bem integrado, mas o modelo relacional
  (bandas/membros/permissões/junções) fica menos natural que no Postgres/RLS.
- **Backend próprio (Node/API)**: controle total, porém muito mais infra (auth, deploy,
  realtime) pra um projeto que quer se manter frontend-first.

## Consequências

- Ganhamos contas, sync, colaboração e uma base de permissões robusta.
- Passamos a ter dependências de provisionamento (projeto/credenciais) e um custo de sync
  a gerenciar (offline/realtime).
- O modelo "repertório da banda + prática pessoal" exige refatorar o estado atual
  (hoje a prática é global por música; passa a ser por usuário+música).
