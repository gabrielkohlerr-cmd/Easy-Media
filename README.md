# Easy Media

Plataforma de gestão de conteúdo para redes sociais, com contas reais de
usuário, fluxo de aprovação de cliente e relatórios de desempenho.

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
dados de demonstração fixos — o resto (contas, squads, carteira de clientes
e os posts com mídia) é real e persistido em banco/disco.

## Estrutura

- `src/` — frontend (Vite + React + react-router).
- `server/` — API (Express) com banco SQLite (`node:sqlite`), autenticação
  por e-mail/senha (JWT), upload de arquivos (`multer`, salvos em `uploads/`)
  e as rotas de squad/convites/clientes/posts/perfil.

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
