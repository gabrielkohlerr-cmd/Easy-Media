import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rotaAuth } from "./rotas/auth.js";
import { rotaSquad } from "./rotas/squad.js";
import { rotaClientes } from "./rotas/clientes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTA = process.env.PORT || 4000;

const app = express();
app.use(express.json());

app.use("/api/auth", rotaAuth);
app.use("/api/squad", rotaSquad);
app.use("/api/clientes", rotaClientes);

const DIST = path.join(__dirname, "..", "dist");
app.use(express.static(DIST));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(DIST, "index.html"));
});

app.listen(PORTA, () => {
  console.log(`Easy Media API rodando em http://localhost:${PORTA}`);
});
