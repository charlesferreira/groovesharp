# GrooveSharp 🎸

Companheiro de prática pra músico: acompanhe a **saúde** de cada música do seu
setlist, saiba **o que treinar** e chegue **no ponto pro show**.

**App no ar:** https://charlesferreira.github.io/groovesharp/ (instalável no celular)

## A ideia

Cada música tem uma "saúde" que **cai com o tempo desde o último treino**, numa
velocidade que depende de **quão bem você a conhece**:

- Uma que você **manda bem / de cor** decai devagar → fica verde por semanas.
- Uma que você **trava** decai rápido → fica vermelha em dias.

Você registra o treino com um toque (😎 Mandei bem / 🙂 Foi ok / 😬 Travei), e a
cor de cada música te diz na hora o que está saudável e o que precisa de atenção.

## Funcionalidades

- **Saúde por música** com decaimento por meia-vida (mandei bem 60d · foi ok 14d · travei 4d).
- **Ordenação por prioridade** — as mais críticas (e as nunca praticadas) no topo.
- **Escala de tempo** — do treino constante (semanas) à véspera de show (horas).
- **Vários setlists** — crie, renomeie, exclua; troque entre eles.
- **Biblioteca editável** — adicione/edite/remova músicas, com tom, BPM, afinação,
  anotações e links.
- **Prontidão pro show** — data do show, contagem regressiva, saúde projetada pro
  dia e o que reforçar antes.
- **Modo palco** — tela cheia com a música atual, info, navegação e tela sempre acesa.
- **Simulação** — "prevê o futuro" sem alterar os dados, pra ver como o setlist estará.
- **PWA** — instalável no celular e funciona offline.
- **Backup** — exporte/importe tudo em JSON.

Os dados ficam no `localStorage` do próprio aparelho (sem backend). Use o backup
pra não perder nada e pra passar entre dispositivos.

## Desenvolvimento

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm run test       # testes (Vitest) em watch
npm run test:run   # testes uma vez
npm run build      # typecheck + build de produção
```

## Stack

React + TypeScript + Vite · Vitest + Testing Library · vite-plugin-pwa ·
deploy automático no GitHub Pages via GitHub Actions.

Toda a lógica de domínio (saúde, tempo, setlist, prontidão, backup, estado) vive
em [`src/lib/`](src/lib/) como funções puras testadas; os componentes em
[`src/components/`](src/components/).

## Histórico

O projeto nasceu como um protótipo de arquivo único, preservado em
[`legacy/`](legacy/). Veja o [ROADMAP](ROADMAP.md) pra visão geral das fases.
