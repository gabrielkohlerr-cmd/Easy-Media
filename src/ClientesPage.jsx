import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LAVANDA, TINTA, CINZA } from "./theme.js";
import { Toast } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import CarteiraClientes from "./CarteiraClientes.jsx";
import NavLateral from "./NavLateral.jsx";

export default function ClientesPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    const resultado = searchParams.get("instagram");
    if (!resultado) return;
    mostrar(resultado === "conectado" ? "✓ Instagram conectado" : "Não deu pra conectar o Instagram. Tente novamente.");
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA, display: "flex" }}>
      <NavLateral usuario={usuario} aoSair={() => { sair(); navigate("/"); }} />

      <main className="ez-conteudo-com-sidebar" style={{ flex: 1, minWidth: 0, maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 24 }}>
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
