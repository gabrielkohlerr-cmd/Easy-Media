# EZ Media

**Make it EZ.** O sistema operacional para social medias e agências —
centraliza clientes, conteúdos, aprovações, calendários, tarefas,
compromissos, publicações e resultados numa única plataforma.

> Nota técnica: o pacote npm, o serviço no Render e a variável de ambiente
> `EASYMEDIA_JWT_SECRET` mantiveram o nome antigo (`easy-media`) por baixo do
> capô, pra não quebrar o deploy já configurado — o rebrand pra "EZ Media" é
> só na marca/interface visível pro usuário.

## Perfis

- **Agência** — cria conta, convida social medias pro squad (link único de
  convite) e gerencia a carteira de clientes, gerando um link de acesso sem
  senha pra cada cliente.
- **Social Media** — cria conta sozinho (freelancer, com sua própria carteira
  de clientes) ou entra no squad de uma agência através de um link de
  convite; envia posts (upload de imagem/vídeo) pra cada cliente aprovar.
- **Cliente** — acessa direto pelo link único enviado pela agência/social
  media (sem cadastro nem senha), vê as imagens/vídeos enviados e aprova ou
  pede alteração.

Cada usuário também pode personalizar o próprio perfil (foto, nome, bio) em
"Meu perfil". Os relatórios (gráficos de alcance/engajamento) ainda usam
dados de demonstração fixos, mas agora com seletor pra escolher de qual
cliente ver o desempenho — o resto (contas, squads, carteira de clientes,
posts com mídia, calendário de conteúdo e agenda de reuniões) é real e
persistido em banco/disco.

Duas ferramentas de calendário, para não confundir:
- **Calendário** — visão por cliente das postagens agendadas (o conteúdo
  que vai pro Instagram).
- **Agenda** — compromissos/reuniões do social media, semana a semana, com
  convite de participantes externos por e-mail e um botão "Adicionar ao
  Google Agenda" (usa o link oficial de criação de evento do Google, sem
  precisar de credenciais de API — o próprio Google envia o convite aos
  e-mails informados quando a reunião é salva).

Além disso, tem um **Kanban** (aba própria) pra organizar o processo de
produção com cartões arrastáveis entre 7 colunas — Solicitações,
Urgência, Revisão Textual, Revisão das artes, Pit Stop, Aprovação do
cliente e Entregue/Concluído. O nome e a cor (bolinha ao lado do título)
de cada coluna podem ser personalizados, por quadro — a mudança só vale
pro quadro pessoal ou de squad em que foi feita, nunca pros dois ao mesmo
tempo. Cada cartão aceita título editável, prazo (data/hora), membros,
comentários, anexos e links. Todo usuário tem um quadro pessoal; quem é
de uma agência (a própria agência e os social medias do squad) também
divide um quadro compartilhado, visível a todo mundo do squad.

Quem entra como Social Media cai primeiro numa tela de **Início**: um
resumo com os cartões do Kanban em urgência, perto do prazo ou já
atrasados (de todos os quadros que o usuário acessa), uma prévia da
semana do calendário e da agenda, insights por cliente e sugestões de
conteúdo ("tendências do dia") organizadas por segmento — tudo com base
no **segmento** e
**nicho** do cliente, por isso os dois viraram campos obrigatórios ao
cadastrar um cliente novo. As sugestões de tendência rodam num banco de
conteúdo por segmento que muda diariamente (não vêm de uma API de
tendências ao vivo, que não temos integrada), e os números de
alcance/engajamento por cliente na tela de Início também são
demonstração, como os do restante dos relatórios.

## Planos e cobrança

Ao cadastrar uma conta de **agência**, o telefone (com DDD) passa a ser
obrigatório, e logo depois do cadastro a agência já cai direto na tela de
**Planos** pra escolher um pacote — não é preciso ir procurar essa opção
depois. A tela **Planos** também fica disponível a qualquer momento pelo
cabeçalho de Agência e de Clientes.

- **Agências**: Básico (R$99,90/mês, até 15 colaboradores e 50 clientes),
  Premium (R$149,90/mês, até 40 colaboradores e 100 clientes, recomendado)
  e Unlimited (R$299,90/mês, colaboradores e clientes ilimitados). As
  funcionalidades da plataforma (API do Instagram, Kanban e calendário da
  equipe, agenda, squad, insights) são as mesmas nos três planos — o que
  muda é só o tamanho do squad/carteira. Cada plano pode ser assinado
  mensal ou anualmente; no anual tem 5% de desconto sobre o total do ano
  (destacado na própria tela, incentivando a assinatura anual).
- **Social media freelancer** (sem agência): cadastro gratuito pra até 20
  clientes; depois disso, dá pra comprar pacotes extras (+20 por R$19,90,
  +30 por R$24,90 ou +50 por R$39,90, pagamento único). Quem é do squad de
  uma agência não vê essa cobrança — o plano de quem gerencia a carteira
  é o da agência.

Ao clicar em "Assinar" ou "Comprar pacote", o usuário é levado pra uma
tela de pagamento com cartão de crédito (número, nome impresso, validade
e CVV). A cobrança ainda não está integrada a um meio de pagamento real —
é uma simulação: os dados do cartão passam só por validações de formato
no navegador e nunca são enviados nem armazenados; ao confirmar, o plano
(ou pacote de clientes) já fica ativo na hora, e a tela seguinte confirma
a "compra" simulada.

Diferente da versão anterior, os limites de cada plano **já são
aplicados de verdade**: uma agência com plano ativo não consegue
cadastrar mais clientes nem aceitar mais colaboradores no squad do que o
plano permite (a tentativa retorna erro pedindo upgrade), e o mesmo vale
pro limite de clientes do freelancer gratuito. Agências que ainda não
escolheram nenhum plano continuam sem restrição, pra não quebrar contas
já em uso antes dessa mudança.

## Estrutura

- `src/` — frontend (Vite + React + react-router).
- `server/` — API (Express) com banco SQLite (`node:sqlite`), autenticação
  por e-mail/senha (JWT), upload de arquivos (`multer`, salvos em `uploads/`)
  e as rotas de squad/convites/clientes/posts/perfil/agenda.

## Desenvolvimento

Instale as dependências e rode o frontend e a API juntos:

```bash
npm install
npm run dev:full
```

Isso sobe a API em `http://localhost:4000` e o Vite em `http://localhost:5173`
(com proxy de `/api` pra API). Ou rode cada um separadamente com
`npm run server` e `npm run dev`.

O banco fica em `server/easymedia.db` (criado automaticamente). Defina
`EASYMEDIA_JWT_SECRET` num `.env`/variável de ambiente antes de ir pra
produção — sem isso, um segredo de desenvolvimento fixo é usado.

## Build e produção

```bash
npm run build   # gera dist/
npm start       # build + sobe a API servindo o frontend, tudo na mesma porta
```

## Deploy no Render

O repositório já inclui um `render.yaml` pronto:

1. Crie uma conta em [render.com](https://render.com) (tem plano gratuito).
2. **New +** → **Blueprint** → conecte este repositório GitHub e selecione a
   branch com o código (`claude/easy-media-prototype-v39ksn`).
3. O Render lê o `render.yaml` automaticamente (build, start command e o
   segredo do JWT já configurados) — clique em **Apply** e aguarde o deploy.
4. Ao terminar, o Render mostra a URL pública (algo como
   `https://easy-media.onrender.com`).

**Importante:** no plano gratuito o disco é efêmero — o banco
(`server/easymedia.db`) e os arquivos enviados (`uploads/`) são apagados a
cada novo deploy. Ótimo pra testar a aplicação; pra manter os dados entre
deploys, é preciso um plano pago com "Persistent Disk".

## Conectar o Instagram de um cliente

Cada cliente da carteira pode ter o próprio Instagram conectado (botão
"Conectar Instagram" na tela de clientes), autorizando a EZ Media a
publicar posts e responder comentários em nome daquela conta. Isso usa a
API oficial do Instagram (via Meta) e **exige credenciais reais** — sem
elas, o botão mostra um aviso e nada quebra, mas a conexão não funciona.

Passo a passo pra habilitar:

1. Crie uma conta em [developers.facebook.com](https://developers.facebook.com)
   e um novo App (tipo "Business").
2. No painel do App, adicione o produto **Instagram** (Instagram API with
   Instagram Login).
3. Em **Configurações do produto Instagram**, adicione como "URI de
   redirecionamento OAuth válido":
   `https://SEU-DOMINIO/api/instagram/callback`
   (troque `SEU-DOMINIO` pela URL do seu deploy, ex: a do Render).
4. Copie o **App ID** e o **App Secret** do painel e configure como
   variáveis de ambiente no Render (Settings → Environment):
   - `INSTAGRAM_APP_ID`
   - `INSTAGRAM_APP_SECRET`
5. Em modo de desenvolvimento (padrão de um App novo), só contas do
   Instagram adicionadas manualmente como **"Testador do Instagram"** no
   painel do App conseguem autorizar a conexão — a própria conta do
   Instagram precisa aceitar o convite de testador (Configurações do
   Instagram → Apps e sites → Convites de testador). Pra funcionar com
   qualquer cliente sem esse passo manual, o App precisa passar pela
   revisão do Meta (App Review + verificação de negócio).

Limitações da integração atual:
- Publica imagem única e carrossel de imagens automaticamente quando o
  cliente aprova o post. Vídeo ainda não é publicado automaticamente
  (fica registrado o motivo no post, pra publicar manualmente).
- Os tokens de acesso são de longa duração (~60 dias) mas não há rotina
  automática de renovação ainda — reconectar manualmente quando expirar.

## Vídeo do hero da página inicial

O hero da home (`src/LoginPage.jsx`) está preparado pra tocar em loop, sem
áudio, um vídeo de fundo (ex: um escritório de agência em pleno caos, com
um corte pro momento em que a EZ Media aparece na tela de quem está calmo
no meio da confusão). Basta colocar o arquivo em:

```
public/video/escritorio-caos.mp4
```

Sem o arquivo, o hero cai graciosamente pra um fundo em gradiente — o
layout não quebra, só fica sem o vídeo. Formatos recomendados: MP4 (H.264),
1920×1080 ou 1280×720, até ~15-20s em loop, sem trilha sonora (o `<video>`
já é forçado a `muted`).
