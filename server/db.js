import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAMINHO_DB = process.env.EASYMEDIA_DB_PATH || path.join(__dirname, "easymedia.db");

export const db = new DatabaseSync(CAMINHO_DB);

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('social_media','agencia')),
    nome_negocio TEXT,
    agencia_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    dono_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_acesso TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS convites_squad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agencia_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','aceito','revogado')),
    aceito_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK(tipo IN ('reels','carrossel','estatico')),
    titulo TEXT NOT NULL,
    legenda TEXT,
    data_agendada TEXT,
    hora_agendada TEXT,
    status TEXT NOT NULL DEFAULT 'aguardando' CHECK(status IN ('aguardando','agendado','publicado','alteracao')),
    feedback TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts_midias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('imagem','video')),
    ordem INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reunioes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    local TEXT,
    inicio TEXT NOT NULL,
    fim TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reunioes_convidados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reuniao_id INTEGER NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
    email TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quadros_kanban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('pessoal','squad')),
    dono_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    agencia_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cartoes_kanban (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quadro_id INTEGER NOT NULL REFERENCES quadros_kanban(id) ON DELETE CASCADE,
    coluna TEXT NOT NULL DEFAULT 'solicitacoes' CHECK(coluna IN (
      'solicitacoes','urgencia','revisao_textual','revisao_artes','pit_stop','aprovacao_cliente','entregue'
    )),
    titulo TEXT NOT NULL,
    descricao TEXT,
    autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cartoes_kanban_membros (
    cartao_id INTEGER NOT NULL REFERENCES cartoes_kanban(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (cartao_id, usuario_id)
  );

  CREATE TABLE IF NOT EXISTS cartoes_kanban_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cartao_id INTEGER NOT NULL REFERENCES cartoes_kanban(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cartoes_kanban_anexos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cartao_id INTEGER NOT NULL REFERENCES cartoes_kanban(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK(tipo IN ('arquivo','link')),
    url TEXT NOT NULL,
    nome TEXT,
    autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function adicionarColunaSeNaoExistir(tabela, coluna, definicao) {
  const colunas = db.prepare(`PRAGMA table_info(${tabela})`).all();
  if (!colunas.some(c => c.name === coluna)) {
    db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
  }
}

adicionarColunaSeNaoExistir("usuarios", "foto_perfil_url", "TEXT");
adicionarColunaSeNaoExistir("usuarios", "bio", "TEXT");

adicionarColunaSeNaoExistir("clientes", "instagram_user_id", "TEXT");
adicionarColunaSeNaoExistir("clientes", "instagram_username", "TEXT");
adicionarColunaSeNaoExistir("clientes", "instagram_access_token", "TEXT");
adicionarColunaSeNaoExistir("clientes", "instagram_token_expira_em", "TEXT");
adicionarColunaSeNaoExistir("clientes", "instagram_conectado_em", "TEXT");

adicionarColunaSeNaoExistir("posts", "instagram_media_id", "TEXT");
adicionarColunaSeNaoExistir("posts", "instagram_permalink", "TEXT");
adicionarColunaSeNaoExistir("posts", "instagram_publicado_em", "TEXT");
adicionarColunaSeNaoExistir("posts", "instagram_erro", "TEXT");
