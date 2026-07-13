import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Cartao, Botao, Toast } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
};

export default function PerfilPage() {
  const { usuario, recarregarUsuario } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario?.nome || "");
  const [nomeNegocio, setNomeNegocio] = useState(usuario?.nome_negocio || "");
  const [bio, setBio] = useState(usuario?.bio || "");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(usuario?.foto_perfil_url || null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  if (!usuario) return null;

  const escolherFoto = e => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  };

  const salvar = async e => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("nomeNegocio", nomeNegocio);
      formData.append("bio", bio);
      if (foto) formData.append("foto", foto);
      await api.atualizarPerfil(formData);
      await recarregarUsuario();
      mostrar("✓ Perfil atualizado");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 640, margin: "0 auto", padding: "14px 20px",
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

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 60px" }}>
        <Cartao style={{ padding: 28 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: TINTA }}>Meu perfil</h1>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: CINZA, fontWeight: 600 }}>
            Personalize sua foto e as informações que aparecem pro seu squad e clientes.
          </p>

          <form onSubmit={salvar} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: LAVANDA_2,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800, color: ROXO, flexShrink: 0,
              }}>
                {previewFoto
                  ? <img src={previewFoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (usuario.nome?.[0]?.toUpperCase() || "?")}
              </div>
              <label className="em-btn" style={{
                display: "inline-block", cursor: "pointer", fontFamily: "inherit", fontWeight: 800,
                fontSize: 13, padding: "10px 18px", borderRadius: 999,
                background: "transparent", color: ROXO, border: `2px solid ${LAVANDA_2}`,
              }}>
                Alterar foto
                <input type="file" accept="image/*" onChange={escolherFoto} style={{ display: "none" }} />
              </label>
            </div>

            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Nome
              <input value={nome} onChange={e => setNome(e.target.value)} style={campoEstilo} />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              {usuario.tipo === "agencia" ? "Nome da agência" : "Nome do seu negócio"}
              <input value={nomeNegocio} onChange={e => setNomeNegocio(e.target.value)} placeholder="Opcional" style={campoEstilo} />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Bio
              <textarea
                value={bio} onChange={e => setBio(e.target.value)} placeholder="Uma frase curta sobre você ou sua agência"
                style={{ ...campoEstilo, minHeight: 80, resize: "vertical" }}
              />
            </label>

            {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <Botao type="submit">{enviando ? "Salvando…" : "Salvar alterações"}</Botao>
              <Botao variante="fantasma" onClick={() => navigate(-1)}>Voltar</Botao>
            </div>
          </form>
        </Cartao>
      </main>

      <Toast msg={toast} />
    </div>
  );
}
