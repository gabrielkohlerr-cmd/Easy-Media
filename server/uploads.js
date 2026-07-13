import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PASTA_UPLOADS = path.join(__dirname, "..", "uploads");

const PASTA_POSTS = path.join(PASTA_UPLOADS, "posts");
const PASTA_PERFIS = path.join(PASTA_UPLOADS, "perfis");
fs.mkdirSync(PASTA_POSTS, { recursive: true });
fs.mkdirSync(PASTA_PERFIS, { recursive: true });

function armazenamento(destino) {
  return multer.diskStorage({
    destination: destino,
    filename: (req, file, cb) => {
      cb(null, randomBytes(9).toString("hex") + path.extname(file.originalname));
    },
  });
}

function apenasImagemOuVideo(req, file, cb) {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) cb(null, true);
  else cb(new Error("Envie apenas arquivos de imagem ou vídeo."));
}

function apenasImagem(req, file, cb) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Envie apenas um arquivo de imagem."));
}

export const uploadMidiasPost = multer({
  storage: armazenamento(PASTA_POSTS),
  fileFilter: apenasImagemOuVideo,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});

export const uploadFotoPerfil = multer({
  storage: armazenamento(PASTA_PERFIS),
  fileFilter: apenasImagem,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});
