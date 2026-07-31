import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Botao, Cartao, Toast, Pill } from "./components.jsx";
import { IconePasta, IconeLapis, IconeLink, IconeAnexo } from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import NavLateral from "./NavLateral.jsx";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
  width: "100%", boxSizing: "border-box",
};

const TIPOS = [
  { id: "nota", rotulo: "Nota / roteiro", Icone: IconeLapis },
  { id: "link", rotulo: "Link", Icone: IconeLink },
  { id: "arquivo", rotulo: "Arquivo", Icone: IconeAnexo },
];

function IconeDoTipo({ tipo, ...props }) {
  const Icone = TIPOS.find(t => t.id === tipo)?.Icone || IconeAnexo;
  return <Icone {...props} />;
}

function NovoDocumentoForm({ clienteId, aoCriado }) {
  const [tipo, setTipo] = useState("nota");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const limpar = () => { setTitulo(""); setConteudo(""); setArquivo(null); };

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      if (tipo === "arquivo") {
        if (!arquivo) { setErro("Escolha um arquivo."); return; }
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        if (titulo.trim()) formData.append("titulo", titulo.trim());
        await api.enviarArquivoPasta(clienteId, formData);
      } else {
        if (!titulo.trim()) { setErro("Informe um título."); return; }
        if (!conteudo.trim()) { setErro(tipo === "nota" ? "Escreva o conteúdo da nota." : "Informe um link."); return; }
        await api.criarDocumentoPasta(clienteId, { tipo, titulo: titulo.trim(), conteudo: conteudo.trim() });
      }
      limpar();
      aoCriado();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Cartao>
      <div style={{ display: "flex", gap: 6, background: LAVANDA, borderRadius: 999, padding: 4, marginBottom: 14, width: "fit-content" }}>
        {TIPOS.map(t => (
          <button key={t.id} onClick={() => { setTipo(t.id); setErro(""); }} className="em-btn" style={{
            display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: 800, fontSize: 13, padding: "8px 14px", borderRadius: 999,
            background: tipo === t.id ? ROXO : "transparent", color: tipo === t.id ? "#fff" : CINZA,
          }}>
            <t.Icone tamanho={13} /> {t.rotulo}
          </button>
        ))}
      </div>

      <form onSubmit={submeter} style={{ display: "grid", gap: 10 }}>
        {tipo !== "arquivo" && (
          <input
            value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder={tipo === "nota" ? "Título da nota (ex: Roteiro reels julho)" : "Título do link"}
            style={campoEstilo}
          />
        )}
        {tipo === "nota" && (
          <textarea
            value={conteudo} onChange={e => setConteudo(e.target.value)}
            placeholder="Planejamento, roteiro ou anotação sobre o cliente…" rows={5}
            style={{ ...campoEstilo, resize: "vertical" }}
          />
        )}
        {tipo === "link" && (
          <input
            value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="https://…"
            style={campoEstilo}
          />
        )}
        {tipo === "arquivo" && (
          <>
            <input
              value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título (opcional)"
              style={campoEstilo}
            />
            <input type="file" onChange={e => setArquivo(e.target.files?.[0] || null)} />
          </>
        )}
        {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
        <div><Botao pequeno type="submit" disabled={enviando}>{enviando ? "Salvando…" : "Adicionar à pasta"}</Botao></div>
      </form>
    </Cartao>
  );
}

export default function PastaClientePage() {
  const { clienteId } = useParams();
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const carregar = () => {
    Promise.all([api.listarClientes(), api.listarPastaCliente(clienteId)]).then(([c, p]) => {
      setCliente(c.clientes.find(item => String(item.id) === String(clienteId)) || null);
      setDocumentos(p.documentos);
    }).finally(() => setCarregando(false));
  };

  useEffect(carregar, [clienteId]);

  const remover = async id => {
    await api.removerDocumentoPasta(id);
    mostrar("Documento removido da pasta");
    carregar();
  };

  if (carregando) return null;

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA, display: "flex" }}>
      <NavLateral usuario={usuario} aoSair={() => { sair(); navigate("/"); }} />

      <main className="ez-conteudo-com-sidebar" style={{ flex: 1, minWidth: 0, maxWidth: 860, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div>
          <button onClick={() => navigate(-1)} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
            fontWeight: 700, fontSize: 13, color: CINZA, textDecoration: "underline", padding: 0, marginBottom: 10,
          }}>← Voltar</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconePasta tamanho={22} style={{ color: ROXO }} />
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>
              Pasta {cliente ? `· ${cliente.nome}` : ""}
            </h1>
          </div>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            Planejamentos, roteiros e outros materiais de referência desse cliente, num só lugar.
          </p>
        </div>

        <NovoDocumentoForm clienteId={clienteId} aoCriado={() => { mostrar("✓ Adicionado à pasta"); carregar(); }} />

        <Cartao>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: TINTA }}>
            Itens na pasta ({documentos.length})
          </h3>
          {documentos.length === 0 ? (
            <p style={{ margin: 0, color: CINZA, fontWeight: 600, fontSize: 14 }}>Nada por aqui ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {documentos.map(d => (
                <div key={d.id} style={{
                  background: LAVANDA, borderRadius: 14, padding: "12px 14px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <Pill cor={ROXO} bg="#fff">
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <IconeDoTipo tipo={d.tipo} tamanho={11} /> {TIPOS.find(t => t.id === d.tipo)?.rotulo}
                        </span>
                      </Pill>
                      <span style={{ fontSize: 11, fontWeight: 600, color: CINZA }}>
                        {d.autorNome} · {new Date(d.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, color: TINTA, fontSize: 14, marginBottom: 2 }}>{d.titulo}</div>
                    {d.tipo === "nota" && (
                      <p style={{ margin: 0, fontSize: 13, color: TINTA, fontWeight: 600, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                        {d.conteudo}
                      </p>
                    )}
                    {(d.tipo === "link" || d.tipo === "arquivo") && (
                      <a href={d.conteudo} target="_blank" rel="noreferrer" style={{
                        fontSize: 13, fontWeight: 700, color: ROXO, wordBreak: "break-all",
                      }}>
                        {d.tipo === "arquivo" ? "Abrir arquivo ↗" : d.conteudo}
                      </a>
                    )}
                  </div>
                  <button onClick={() => remover(d.id)} aria-label="Remover" className="em-btn" style={{
                    border: "none", background: "transparent", cursor: "pointer", color: CINZA,
                    fontSize: 16, fontWeight: 800, padding: 0, flexShrink: 0,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Cartao>
      </main>

      <Toast msg={toast} />
    </div>
  );
}
