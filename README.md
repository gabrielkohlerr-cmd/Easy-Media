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
