# Easy Media

Plataforma de gestão de conteúdo para redes sociais, com contas reais de
usuário, fluxo de aprovação de cliente e relatórios de desempenho.

## Perfis

- **Agência** — cria conta, convida social medias pro squad (link único de
  convite) e gerencia a carteira de clientes, gerando um link de acesso sem
  senha pra cada cliente.
- **Social Media** — cria conta sozinho (freelancer) ou entra no squad de uma
  agência através de um link de convite; acessa a fila de conteúdo e
  relatórios dos clientes.
- **Cliente** — acessa direto pelo link único enviado pela agência/social
  media (sem cadastro nem senha) e aprova ou pede alteração nos posts.

A fila de conteúdo e os relatórios (gráficos de alcance/engajamento) ainda
usam dados de demonstração fixos — o cadastro de usuários, squads e carteira
de clientes já são reais e persistidos em banco.

## Estrutura

- `src/` — frontend (Vite + React + react-router).
- `server/` — API (Express) com banco SQLite (`node:sqlite`), autenticação
  por e-mail/senha (JWT) e as rotas de squad/convites/clientes.

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
