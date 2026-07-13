import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LAVANDA, LAVANDA_2, TINTA, CINZA, ROXO } from "./theme.js";
import { Cartao, Toast } from "./components.jsx";
import { VisaoCliente, POSTS_INICIAIS } from "./App.jsx";
import { api } from "./api.js";

export default function ClientePortal() {
  const { token } = useParams();
  const [cliente, setCliente] = useState(undefined);
  const [posts, setPosts] = useState(POSTS_INICIAIS);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.acessoCliente(token).then(({ cliente }) => setCliente(cliente)).catch(() => setCliente(null));
  }, [token]);

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const aprovar = id => {
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, status: "agendado" } : p)));
    mostrar("✓ Post aprovado e agendado no Instagram");
  };

  const reprovar = (id, feedback) => {
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, status: "alteracao", feedback } : p)));
    mostrar("Alteração enviada ao social media");
  };

  if (cliente === undefined) return null;

  if (cliente === null) {
    return (
      <div style={{
        minHeight: "100vh", background: LAVANDA, color: TINTA,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <Cartao style={{ textAlign: "center", padding: 32, maxWidth: 420 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: TINTA }}>Link inválido</h1>
          <p style={{ color: CINZA, fontWeight: 600 }}>
            Esse link de acesso não existe mais. Peça um novo link pra sua agência ou social media.
          </p>
        </Cartao>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, background: ROXO,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 18,
          }}>em</div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.5px" }}>
            easy<span style={{ color: ROXO }}>media</span>
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
        <VisaoCliente posts={posts} aoAprovar={aprovar} aoReprovar={reprovar} nomeCliente={cliente.nome} />
      </main>

      <Toast msg={toast} />
    </div>
  );
}
