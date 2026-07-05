# Setlist — Charlie Brown Jr.

Página única (HTML/CSS/JS puro, sem dependências) para acompanhar o setlist de músicas
da Charlie Brown Jr. que estou praticando. Cada música abre a partitura no
[Songsterr](https://www.songsterr.com/).

## Como usar

Abra o arquivo [`index.html`](index.html) no navegador (duplo clique ou arraste pra janela).

## Funcionalidades

- **Lista rolável** com as 38 músicas, numeradas, na ordem do setlist.
- **Clique abre no Songsterr** reaproveitando sempre a mesma aba (`target="songsterr"`),
  em vez de abrir uma aba nova a cada clique.
- **Busca** no topo pra filtrar as músicas (barra fixa ao rolar).
- **Marcador de "já pratiquei"** por música (bolinha), salvo no navegador
  via `localStorage`.
- **Barra de progresso por tempo**: mostra quanto do setlist (em minutos) já foi
  praticado e quanto falta. Uma versão fininha aparece colada na barra de busca
  só quando a barra grande sai da tela.
- **Tempo total** do setlist somado a partir da duração de cada música (~2h 6min).

## Arquivos

- `index.html` — a página do setlist (tudo embutido: HTML, CSS e JS).
- `songsterr.html` — lista bruta original dos links do Songsterr (fonte dos dados).

## Ideias para continuar

- Popup encaixado à direita para ver a partitura ao lado da lista (o Songsterr envia
  `X-Frame-Options: Deny`, então iframe direto não é possível).
- Reordenar músicas / arrastar.
- Marcar tom, BPM ou notas de estudo por música.
