import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, ROXO_ESCURO, LAVANDA, LAVANDA_2, TINTA, CINZA } from "./theme.js";
import { Botao, Cartao, Pill } from "./components.jsx";
import { PreviaPost, STATUS, TIPO_LABEL } from "./App.jsx";
import { api } from "./api.js";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function chaveData(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function gerarGrade(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1);
  const inicio = new Date(ano, mes, 1 - primeiroDia.getDay());
  const dias = [];
  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    dias.push(dia);
  }
  return dias;
}

function SecaoComentarios({ post }) {
  const [comentarios, setComentarios] = useState(null);
  const [erro, setErro] = useState("");
  const [respondendoId, setRespondendoId] = useState(null);
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.listarComentariosInstagram(post.id)
      .then(({ comentarios }) => setComentarios(comentarios))
      .catch(err => setErro(err.message));
  }, [post.id]);

  const enviarResposta = async comentarioId => {
    if (!resposta.trim()) return;
    setEnviando(true);
    try {
      await api.responderComentarioInstagram(post.id, comentarioId, resposta.trim());
      setResposta("");
      setRespondendoId(null);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ marginTop: 14, borderTop: `1px solid ${LAVANDA_2}`, paddingTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 8 }}>COMENTÁRIOS DO INSTAGRAM</div>
      {erro && <div style={{ fontSize: 13, color: "#F43F5E", fontWeight: 600 }}>{erro}</div>}
      {!erro && comentarios === null && <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>Carregando…</div>}
      {comentarios?.length === 0 && (
        <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>Nenhum comentário ainda.</div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        {comentarios?.map(c => (
          <div key={c.id} style={{ background: LAVANDA, borderRadius: 12, padding: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>@{c.username}</div>
            <div style={{ fontSize: 13, color: TINTA, fontWeight: 600 }}>{c.text}</div>
            {respondendoId === c.id ? (
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <input
                  value={resposta} onChange={e => setResposta(e.target.value)} placeholder="Escreva sua resposta…"
                  style={{
                    flex: 1, borderRadius: 10, border: `2px solid ${LAVANDA_2}`, padding: "6px 10px",
                    fontFamily: "inherit", fontWeight: 600, fontSize: 13, outline: "none",
                  }}
                />
                <Botao pequeno onClick={() => enviarResposta(c.id)}>{enviando ? "…" : "Enviar"}</Botao>
              </div>
            ) : (
              <button onClick={() => { setRespondendoId(c.id); setResposta(""); }} className="em-btn" style={{
                marginTop: 4, border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: ROXO, padding: 0,
              }}>Responder</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalPost({ post, aoFechar }) {
  const s = STATUS[post.status];
  return (
    <div onClick={aoFechar} style={{
      position: "fixed", inset: 0, background: "rgba(34,20,72,.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
        <Cartao style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Pill cor={ROXO} bg={LAVANDA_2}>{TIPO_LABEL[post.tipo] || post.tipo}</Pill>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 30, height: 30, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 15,
            }}>×</button>
          </div>
          <PreviaPost post={post} grande />
          <h3 style={{ margin: "14px 0 4px", fontSize: 17, fontWeight: 800, color: TINTA }}>{post.titulo}</h3>
          {post.legenda && (
            <p style={{ margin: "0 0 12px", fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5 }}>
              {post.legenda}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>
              📅 {post.data?.split("-").reverse().join("/") || "sem data"} {post.hora && `às ${post.hora}`}
            </span>
            <Pill cor={s.cor} bg={s.bg}>{s.label}</Pill>
          </div>
          {post.status === "alteracao" && post.feedback && (
            <div style={{ marginTop: 12, background: "#FFF1F2", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#F43F5E", marginBottom: 2 }}>
                Alteração pedida pelo cliente
              </div>
              <div style={{ fontSize: 13, color: TINTA, fontWeight: 600 }}>“{post.feedback}”</div>
            </div>
          )}
          {post.instagramErro && (
            <div style={{ marginTop: 12, background: "#FFF1F2", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#F43F5E", marginBottom: 2 }}>
                Não publicou no Instagram automaticamente
              </div>
              <div style={{ fontSize: 13, color: TINTA, fontWeight: 600 }}>{post.instagramErro}</div>
            </div>
          )}
          {post.instagramPermalink && (
            <a href={post.instagramPermalink} target="_blank" rel="noreferrer" style={{
              display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 800, color: ROXO,
            }}>Ver no Instagram ↗</a>
          )}
          {post.instagramMediaId && <SecaoComentarios post={post} />}
        </Cartao>
      </div>
    </div>
  );
}

export default function CalendarioPage() {
  const navigate = useNavigate();
  const hoje = new Date();

  const [clientes, setClientes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [postAberto, setPostAberto] = useState(null);

  useEffect(() => {
    Promise.all([api.listarClientes(), api.listarPosts()]).then(([c, p]) => {
      setClientes(c.clientes);
      setPosts(p.posts);
      setClienteSelecionado(atual => atual || c.clientes[0]?.nome || "");
      setCarregando(false);
    });
  }, []);

  const postsPorDia = useMemo(() => {
    const mapa = {};
    posts
      .filter(p => p.cliente === clienteSelecionado && p.data)
      .forEach(p => {
        (mapa[p.data] ||= []).push(p);
      });
    return mapa;
  }, [posts, clienteSelecionado]);

  const dias = useMemo(
    () => gerarGrade(mesAtual.getFullYear(), mesAtual.getMonth()),
    [mesAtual],
  );

  const mudarMes = delta => {
    setMesAtual(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const chaveHoje = chaveData(hoje);

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "14px 20px",
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

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Calendário</h1>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            Acompanhe as postagens agendadas de cada cliente, mês a mês.
          </p>
        </div>

        {!carregando && clientes.length === 0 && (
          <Cartao style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32 }}>🗂️</div>
            <div style={{ fontWeight: 800, color: TINTA, fontSize: 16 }}>Nenhum cliente na carteira ainda</div>
            <div style={{ color: CINZA, fontWeight: 600, fontSize: 14 }}>
              Adicione um cliente pra começar a agendar posts no calendário.
            </div>
          </Cartao>
        )}

        {!carregando && clientes.length > 0 && (
          <>
            <Cartao style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <select
                value={clienteSelecionado} onChange={e => setClienteSelecionado(e.target.value)}
                style={{
                  borderRadius: 999, border: `2px solid ${LAVANDA_2}`, padding: "10px 16px",
                  fontFamily: "inherit", fontWeight: 800, fontSize: 14, color: ROXO, outline: "none",
                  background: LAVANDA,
                }}
              >
                {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="em-btn" style={{
                  border: `2px solid ${LAVANDA_2}`, background: "#fff", width: 34, height: 34, borderRadius: 999,
                  cursor: "pointer", fontWeight: 800, color: ROXO, fontSize: 16,
                }}>‹</button>
                <span style={{ fontWeight: 800, fontSize: 15, color: TINTA, minWidth: 150, textAlign: "center" }}>
                  {NOMES_MES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <button onClick={() => mudarMes(1)} aria-label="Próximo mês" className="em-btn" style={{
                  border: `2px solid ${LAVANDA_2}`, background: "#fff", width: 34, height: 34, borderRadius: 999,
                  cursor: "pointer", fontWeight: 800, color: ROXO, fontSize: 16,
                }}>›</button>
                <Botao pequeno variante="fantasma" onClick={() => setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}>
                  Hoje
                </Botao>
              </div>
            </Cartao>

            <Cartao style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: ROXO_ESCURO }}>
                {DIAS_SEMANA.map(d => (
                  <div key={d} style={{ padding: "10px 6px", textAlign: "center", fontSize: 12, fontWeight: 800, color: "#DDD6FE" }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {dias.map(dia => {
                  const chave = chaveData(dia);
                  const doMesAtual = dia.getMonth() === mesAtual.getMonth();
                  const posts_ = postsPorDia[chave] || [];
                  const ehHoje = chave === chaveHoje;
                  return (
                    <div key={chave} style={{
                      minHeight: 96, padding: 8, borderRight: `1px solid ${LAVANDA_2}`, borderBottom: `1px solid ${LAVANDA_2}`,
                      background: doMesAtual ? "#fff" : LAVANDA, opacity: doMesAtual ? 1 : 0.5,
                    }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%", fontSize: 12, fontWeight: 800,
                        background: ehHoje ? ROXO : "transparent", color: ehHoje ? "#fff" : CINZA,
                        marginBottom: 4,
                      }}>
                        {dia.getDate()}
                      </div>
                      <div style={{ display: "grid", gap: 4 }}>
                        {posts_.slice(0, 3).map(p => {
                          const s = STATUS[p.status];
                          return (
                            <button key={p.id} onClick={() => setPostAberto(p)} className="em-btn" style={{
                              display: "block", width: "100%", textAlign: "left", border: "none",
                              background: s.bg, color: s.cor, borderRadius: 8, padding: "3px 6px",
                              fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {p.hora ? `${p.hora} · ` : ""}{p.titulo}
                            </button>
                          );
                        })}
                        {posts_.length > 3 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: CINZA }}>+{posts_.length - 3} mais</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Cartao>
          </>
        )}
      </main>

      {postAberto && <ModalPost post={postAberto} aoFechar={() => setPostAberto(null)} />}
    </div>
  );
}
