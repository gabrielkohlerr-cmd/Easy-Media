import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LAVANDA, TINTA, CINZA } from "./theme.js";
import { Cartao, Toast, Marca } from "./components.jsx";
import { IconeAlerta } from "./icones.jsx";
import { VisaoCliente } from "./App.jsx";
import { api } from "./api.js";

export default function ClientePortal() {
  const { token } = useParams();
  const [cliente, setCliente] = useState(undefined);
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState("");

  const carregarPosts = () => {
    api.listarPostsClientePublico(token).then(({ posts }) => setPosts(posts)).catch(() => {});
  };

  useEffect(() => {
    api.acessoCliente(token).then(({ cliente }) => { setCliente(cliente); carregarPosts(); }).catch(() => setCliente(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const aprovar = async id => {
    await api.aprovarPostCliente(token, id);
    mostrar("✓ Post aprovado e agendado no Instagram");
    carregarPosts();
  };

  const reprovar = async (id, feedback) => {
    await api.reprovarPostCliente(token, id, feedback);
    mostrar("Alteração enviada ao social media");
    carregarPosts();
  };

  if (cliente === undefined) return null;

  if (cliente === null) {
    return (
      <div style={{
        minHeight: "100vh", background: LAVANDA, color: TINTA,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <Cartao style={{ textAlign: "center", padding: 32, maxWidth: 420 }}>
          <div style={{ display: "flex", justifyContent: "center", color: CINZA, marginBottom: 6 }}>
            <IconeAlerta tamanho={32} />
          </div>
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
        position: "sticky", top: 0, zIndex: 20, background: "rgba(0,0,0,.88)",
        backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.1)",
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Marca />
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
        <VisaoCliente posts={posts} aoAprovar={aprovar} aoReprovar={reprovar} nomeCliente={cliente.nome} />
      </main>

      <Toast msg={toast} />
    </div>
  );
}
