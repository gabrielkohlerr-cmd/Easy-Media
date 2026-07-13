import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rotaAuth } from "./rotas/auth.js";
import { rotaSquad } from "./rotas/squad.js";
import { rotaClientes } from "./rotas/clientes.js";
import { rotaPosts } from "./rotas/posts.js";
import { rotaAgenda } from "./rotas/agenda.js";
import { rotaInstagram } from "./rotas/instagram.js";
import { rotaKanban } from "./rotas/kanban.js";
import { PASTA_UPLOADS } from "./uploads.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTA = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use("/uploads", express.static(PASTA_UPLOADS));

app.use("/api/auth", rotaAuth);
app.use("/api/squad", rotaSquad);
app.use("/api/clientes", rotaClientes);
app.use("/api/posts", rotaPosts);
app.use("/api/agenda", rotaAgenda);
app.use("/api/instagram", rotaInstagram);
app.use("/api/kanban", rotaKanban);

const DIST = path.join(__dirname, "..", "dist");
app.use(express.static(DIST));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORTA, () => {
  console.log(`Easy Media API rodando em http://localhost:${PORTA}`);
});
