import React, { useEffect, useState } from "react";
import { ROXO, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Botao, Cartao } from "./components.jsx";
import { api } from "./api.js";

const TIPOS = [
  { valor: "reels", rotulo: "Reels" },
  { valor: "carrossel", rotulo: "Carrossel" },
  { valor: "estatico", rotulo: "Estático" },
];

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
};

export default function NovoPostForm({ clientes, aoCriado, aoCancelar }) {
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [tipo, setTipo] = useState("reels");
  const [titulo, setTitulo] = useState("");
  const [legenda, setLegenda] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [arquivos, setArquivos] = useState([]);
  const [previews, setPrevias] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const urls = arquivos.map(a => ({ url: URL.createObjectURL(a), video: a.type.startsWith("video/") }));
    setPrevias(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u.url));
  }, [arquivos]);

  const escolherArquivos = e => {
    const lista = Array.from(e.target.files || []);
    setArquivos(tipo === "carrossel" ? lista : lista.slice(0, 1));
  };

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    if (!clienteId) { setErro("Selecione um cliente."); return; }
    if (!titulo.trim()) { setErro("Informe um título."); return; }
    if (!arquivos.length) { setErro("Selecione ao menos uma imagem ou vídeo."); return; }

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("titulo", titulo.trim());
    formData.append("legenda", legenda.trim());
    formData.append("data", data);
    formData.append("hora", hora);
    arquivos.forEach(a => formData.append("midias", a));

    setEnviando(true);
    try {
      await api.criarPost(clienteId, formData);
      aoCriado();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Cartao style={{ border: `2px solid ${ROXO}` }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: TINTA }}>Novo post</h3>
      <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Cliente
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={campoEstilo}>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Formato
            <select
              value={tipo}
              onChange={e => { setTipo(e.target.value); setArquivos(a => (e.target.value === "carrossel" ? a : a.slice(0, 1))); }}
              style={campoEstilo}
            >
              {TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
            </select>
          </label>
        </div>

        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
          Título
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Bastidores do combinado premium" style={campoEstilo} />
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
          {tipo === "carrossel" ? "Imagens (várias)" : "Imagem ou vídeo"}
          <input
            type="file" accept="image/*,video/*" multiple={tipo === "carrossel"}
            onChange={escolherArquivos} style={campoEstilo}
          />
        </label>

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
          <Botao type="submit">{enviando ? "Enviando…" : "Enviar pro cliente aprovar"}</Botao>
          <Botao variante="fantasma" onClick={aoCancelar}>Cancelar</Botao>
        </div>
      </form>
    </Cartao>
  );
}
