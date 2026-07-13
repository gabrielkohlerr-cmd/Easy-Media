import React, { useEffect, useState } from "react";
import { ROXO, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { api } from "./api.js";

const TIPO_LABEL = { reels: "Reels", carrossel: "Carrossel", estatico: "Estático" };

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
};

export default function RevisarPostForm({ post, aoReenviado, aoCancelar }) {
  const [titulo, setTitulo] = useState(post.titulo);
  const [legenda, setLegenda] = useState(post.legenda || "");
  const [data, setData] = useState(post.data || "");
  const [hora, setHora] = useState(post.hora || "");
  const [arquivos, setArquivos] = useState([]);
  const [previews, setPrevias] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ehCarrossel = post.tipo === "carrossel";

  useEffect(() => {
    const urls = arquivos.map(a => ({ url: URL.createObjectURL(a), video: a.type.startsWith("video/") }));
    setPrevias(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u.url));
  }, [arquivos]);

  const escolherArquivos = e => {
    const lista = Array.from(e.target.files || []);
    setArquivos(ehCarrossel ? lista : lista.slice(0, 1));
  };

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    if (!titulo.trim()) { setErro("Informe um título."); return; }

    const formData = new FormData();
    formData.append("titulo", titulo.trim());
    formData.append("legenda", legenda.trim());
    formData.append("data", data);
    formData.append("hora", hora);
    arquivos.forEach(a => formData.append("midias", a));

    setEnviando(true);
    try {
      await api.reenviarPost(post.id, formData);
      aoReenviado();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Cartao style={{ border: `2px solid ${ROXO}` }}>
      <h4 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: TINTA }}>
        Revisar e reenviar pro cliente aprovar
      </h4>
      <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
          Título
          <input value={titulo} onChange={e => setTitulo(e.target.value)} style={campoEstilo} />
        </label>

        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
          Legenda
          <textarea
            value={legenda} onChange={e => setLegenda(e.target.value)} placeholder="Legenda do post"
            style={{ ...campoEstilo, minHeight: 70, resize: "vertical" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Data agendada
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={campoEstilo} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Horário
            <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={campoEstilo} />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
          {ehCarrossel ? "Substituir imagens (opcional)" : "Substituir imagem ou vídeo (opcional)"}
          <input
            type="file" accept="image/*,video/*" multiple={ehCarrossel}
            onChange={escolherArquivos} style={campoEstilo}
          />
        </label>
        <p style={{ margin: 0, fontSize: 12, color: CINZA, fontWeight: 600 }}>
          {ehCarrossel
            ? "Se não enviar novas imagens, o carrossel atual é mantido."
            : "Se não enviar um novo arquivo, a mídia atual é mantida."}
          {" "}Formato ({TIPO_LABEL[post.tipo] || post.tipo}) não muda numa revisão.
        </p>

        {previews.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {previews.map((p, i) => (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", background: LAVANDA_2 }}>
                {p.video
                  ? <video src={p.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                  : <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
          </div>
        )}

        {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <Botao type="submit">{enviando ? "Reenviando…" : "Reenviar pro cliente aprovar"}</Botao>
          <Botao variante="fantasma" onClick={aoCancelar}>Cancelar</Botao>
        </div>
      </form>
    </Cartao>
  );
}
