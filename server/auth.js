import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const SEGREDO_JWT = process.env.EASYMEDIA_JWT_SECRET || "dev-secret-troque-em-producao";
const VALIDADE_TOKEN = "30d";

export function hashSenha(senha) {
  return bcrypt.hashSync(senha, 10);
}

export function conferirSenha(senha, hash) {
  return bcrypt.compareSync(senha, hash);
}

export function gerarToken(usuario) {
  return jwt.sign({ sub: usuario.id, tipo: usuario.tipo }, SEGREDO_JWT, { expiresIn: VALIDADE_TOKEN });
}

export function usuarioPublico(usuario) {
  if (!usuario) return null;
  const { senha_hash: _senha_hash, ...resto } = usuario;
  return resto;
}

export function buscarUsuarioPorId(id) {
  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);
}

export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado." });

  try {
    const payload = jwt.verify(token, SEGREDO_JWT);
    const usuario = buscarUsuarioPorId(payload.sub);
    if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado." });
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

export function exigirTipo(...tipos) {
  return (req, res, next) => {
    if (!tipos.includes(req.usuario.tipo)) {
      return res.status(403).json({ erro: "Você não tem permissão para essa ação." });
    }
    next();
  };
}
