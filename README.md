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
- **Saúde por música** (bolinha verde/amarelo/vermelho, ou cinza pra "nunca
  praticada"). A saúde decai com o tempo desde o último treino, numa velocidade
  que depende de quão bem você conhece a música — uma que você manda bem/de cor
  fica verde por semanas; uma que você trava fica vermelha em dias.
- **Registro de treino**: tocar na bolinha abre 3 opções (😎 Mandei bem /
  🙂 Foi ok / 😬 Travei). Um toque marca a data E define a velocidade de
  decaimento (meia-vida: solid 60d, ok 14d, shaky 4d). Salvo em `localStorage`.
- **Ordenação Setlist / Prioridade**: prioridade joga as músicas mais críticas
  (e as nunca praticadas) pro topo.
- **Escala de tempo (slider)**: acelera o decaimento proporcionalmente, sem mudar
  as proporções entre as avaliações. No padrão (esquerda) a saúde cai ao longo de
  semanas/meses — bom pra treino constante. Puxando pra direita ("véspera de show")
  ela cai em dias/horas, útil pra priorizar o que treinar na semana de um show.
  O registro de treino é um timestamp completo (ms), então funciona em escala de
  horas. Salvo em `localStorage`.
- **Barra de saúde do setlist**: média da saúde de todas as músicas + contagem
  de "quantas precisam de atenção". Versão fininha aparece colada na barra de
  busca só quando a barra grande sai da tela.

## Arquivos

- `index.html` — a página do setlist (tudo embutido: HTML, CSS e JS).
- `songsterr.html` — lista bruta original dos links do Songsterr (fonte dos dados).

## Ideias para continuar

- Tornar a lista editável (adicionar/remover músicas), saindo de uma lista fixa no
  código para uma lista salva no navegador — abrindo caminho para outros setlists
  além do CBJR. **(próximo passo combinado)**
- Popup encaixado à direita para ver a partitura ao lado da lista (o Songsterr envia
  `X-Frame-Options: Deny`, então iframe direto não é possível).
- Marcar tom, BPM ou notas de estudo por música.
