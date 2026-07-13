import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Botao, Toast } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import CarteiraClientes from "./CarteiraClientes.jsx";

export default function ClientesPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, background: ROXO,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 18,
            }}>em</div>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.5px" }}>
              easy<span style={{ color: ROXO }}>media</span>
            </span>
          </div>
          <Botao pequeno variante="fantasma" onClick={() => navigate("/painel")}>Ver painel de conteúdo</Botao>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Meus clientes</h1>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            {usuario?.agencia_id
              ? "Carteira compartilhada com a sua agência. Copie o link de acesso de cada cliente pra enviar posts."
              : "Adicione seus clientes e gere o link de acesso pra cada um acompanhar e aprovar os posts."}
          </p>
        </div>

        <CarteiraClientes mostrar={mostrar} />
      </main>

      <Toast msg={toast} />
    </div>
  );
}
