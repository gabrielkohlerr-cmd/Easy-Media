import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA, AMBAR } from "./theme.js";
import { Botao, Cartao, Toast } from "./components.jsx";
import {
  IconeComentario, IconeAnexo, IconeLink, IconeMais, IconeUsuarios, IconeAlerta, IconeLapis,
} from "./icones.jsx";
import { api } from "./api.js";
import { statusPrazo, rotuloPrazo } from "./prazos.js";
import { useAuth } from "./AuthContext.jsx";
import NavLateral from "./NavLateral.jsx";

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
  width: "100%", boxSizing: "border-box",
};

function iniciais(nome) {
  return (nome || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

function Avatar({ nome, titulo }) {
  return (
    <span title={titulo || nome} style={{
      width: 22, height: 22, borderRadius: "50%", background: LAVANDA_2, color: ROXO,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 800, flexShrink: 0,
    }}>{iniciais(nome)}</span>
  );
}

function BolinhaCor({ cor, tamanho = 9 }) {
  return <span style={{ width: tamanho, height: tamanho, borderRadius: "50%", background: cor, flexShrink: 0 }} />;
}

function PrazoPill({ prazo }) {
  const status = statusPrazo(prazo);
  if (!status) return null;
  const cor = status.estado === "atrasado" ? ROSA : status.estado === "proximo" ? AMBAR : CINZA;
  const bg = status.estado === "atrasado" ? "#FFE4E6" : status.estado === "proximo" ? "#FEF3C7" : LAVANDA;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: cor, background: bg,
      padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{rotuloPrazo(prazo)}</span>
  );
}

function CartaoMini({ cartao, aoAbrir, aoArrastar }) {
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData("text/plain", String(cartao.id)); aoArrastar(cartao.id); }}
      onClick={() => aoAbrir(cartao.id)}
      style={{
        background: "#fff", borderRadius: 14, padding: 12, cursor: "grab",
        border: `1px solid ${LAVANDA_2}`, display: "grid", gap: 8,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: TINTA, lineHeight: 1.35 }}>{cartao.titulo}</div>
      {cartao.prazo && <div><PrazoPill prazo={cartao.prazo} /></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", gap: -6 }}>
          {cartao.membros.slice(0, 4).map(m => <Avatar key={m.id} nome={m.nome} />)}
        </div>
        <div style={{ display: "flex", gap: 8, color: CINZA }}>
          {cartao.totalComentarios > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700 }}>
              <IconeComentario tamanho={12} /> {cartao.totalComentarios}
            </span>
          )}
          {cartao.totalAnexos > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700 }}>
              <IconeAnexo tamanho={12} /> {cartao.totalAnexos}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function NovoCartaoForm({ aoCriar, aoCancelar }) {
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submeter = async e => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setEnviando(true);
    await aoCriar(titulo.trim(), prazo);
    setEnviando(false);
  };

  return (
    <form onSubmit={submeter} style={{ display: "grid", gap: 8 }}>
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <textarea
        autoFocus value={titulo} onChange={e => setTitulo(e.target.value)}
        placeholder="Título do cartão" rows={2}
        style={{ ...campoEstilo, resize: "vertical" }}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) submeter(e); }}
      />
      <label style={{ display: "grid", gap: 4, fontSize: 11, fontWeight: 700, color: CINZA }}>
        Prazo (opcional)
        <input type="datetime-local" value={prazo} onChange={e => setPrazo(e.target.value)} style={campoEstilo} />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <Botao pequeno type="submit" disabled={enviando}>Adicionar</Botao>
        <Botao pequeno variante="fantasma" onClick={aoCancelar}>Cancelar</Botao>
      </div>
    </form>
  );
}

function EditarColuna({ coluna, aoSalvar, aoCancelar }) {
  const [nome, setNome] = useState(coluna.nome);
  const [cor, setCor] = useState(coluna.cor);
  const [enviando, setEnviando] = useState(false);

  const salvar = async e => {
    e.preventDefault();
    if (!nome.trim()) return;
    setEnviando(true);
    await aoSalvar(nome.trim(), cor);
    setEnviando(false);
  };

  return (
    <form onSubmit={salvar} style={{
      display: "grid", gap: 8, background: "#fff", borderRadius: 14, padding: 12,
      border: `2px solid ${ROXO}`,
    }}>
      <input value={nome} onChange={e => setNome(e.target.value)} style={campoEstilo} />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: CINZA }}>
        Cor da coluna
        <input type="color" value={cor} onChange={e => setCor(e.target.value)} style={{
          width: 36, height: 28, border: "none", borderRadius: 8, cursor: "pointer", padding: 0,
        }} />
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <Botao pequeno type="submit" disabled={enviando}>Salvar</Botao>
        <Botao pequeno variante="fantasma" onClick={aoCancelar}>Cancelar</Botao>
      </div>
    </form>
  );
}

function DetalheCartao({ cartaoId, membrosDisponiveis, colunas, aoFechar, aoMudou }) {
  const [cartao, setCartao] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("");
  const [comentario, setComentario] = useState("");
  const [link, setLink] = useState("");
  const [nomeLink, setNomeLink] = useState("");
  const [erro, setErro] = useState("");

  const carregar = () => {
    api.obterCartaoKanban(cartaoId).then(({ cartao }) => {
      setCartao(cartao);
      setTitulo(cartao.titulo);
      setPrazo(cartao.prazo || "");
    }).catch(() => setCartao(null));
  };

  useEffect(carregar, [cartaoId]);

  if (!cartao) return null;

  const membrosIds = new Set(cartao.membros.map(m => m.id));

  const enviarComentario = async e => {
    e.preventDefault();
    if (!comentario.trim()) return;
    await api.comentarCartao(cartaoId, comentario.trim());
    setComentario("");
    carregar();
  };

  const alternarMembro = async (usuarioId, jaEsta) => {
    if (jaEsta) await api.removerMembroCartao(cartaoId, usuarioId);
    else await api.adicionarMembroCartao(cartaoId, usuarioId);
    carregar();
    aoMudou();
  };

  const moverPara = async novaColuna => {
    await api.atualizarCartaoKanban(cartaoId, { coluna: novaColuna });
    carregar();
    aoMudou();
  };

  const salvarTitulo = async () => {
    if (!titulo.trim() || titulo.trim() === cartao.titulo) { setTitulo(cartao.titulo); return; }
    await api.atualizarCartaoKanban(cartaoId, { titulo: titulo.trim() });
    carregar();
    aoMudou();
  };

  const salvarPrazo = async novoPrazo => {
    setPrazo(novoPrazo);
    await api.atualizarCartaoKanban(cartaoId, { prazo: novoPrazo || null });
    carregar();
    aoMudou();
  };

  const enviarArquivo = async e => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErro("");
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    try {
      await api.anexarArquivoCartao(cartaoId, formData);
      carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      e.target.value = "";
    }
  };

  const enviarLink = async e => {
    e.preventDefault();
    if (!link.trim()) return;
    setErro("");
    try {
      await api.anexarLinkCartao(cartaoId, link.trim(), nomeLink.trim());
      setLink(""); setNomeLink("");
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const excluirAnexo = async anexoId => {
    await api.removerAnexoCartao(cartaoId, anexoId);
    carregar();
  };

  const excluirCartao = async () => {
    await api.removerCartaoKanban(cartaoId);
    aoMudou();
    aoFechar();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(23,19,16,.55)", zIndex: 100,
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto",
    }} onClick={aoFechar}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, marginTop: 40 }}>
        <Cartao style={{ padding: 26, display: "grid", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <input
              value={titulo} onChange={e => setTitulo(e.target.value)} onBlur={salvarTitulo}
              style={{
                margin: 0, fontSize: 18, fontWeight: 800, color: TINTA, border: "none",
                background: "transparent", outline: "none", fontFamily: "inherit", flex: 1, padding: 0,
              }}
            />
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 30, height: 30, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 15, flexShrink: 0,
            }}>×</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: CINZA }}>
              ETAPA
              <select
                value={cartao.coluna} onChange={e => moverPara(e.target.value)}
                style={campoEstilo}
              >
                {colunas.map(c => <option key={c.coluna} value={c.coluna}>{c.nome}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: CINZA }}>
              PRAZO
              <input
                type="datetime-local" value={prazo}
                onChange={e => setPrazo(e.target.value)}
                onBlur={() => salvarPrazo(prazo)}
                style={campoEstilo}
              />
            </label>
          </div>
          {cartao.prazo && <div><PrazoPill prazo={cartao.prazo} /></div>}

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 8 }}>
              <IconeUsuarios tamanho={14} /> MEMBROS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {membrosDisponiveis.map(m => {
                const ativo = membrosIds.has(m.id);
                return (
                  <button key={m.id} onClick={() => alternarMembro(m.id, ativo)} className="em-btn" style={{
                    display: "flex", alignItems: "center", gap: 6, border: `2px solid ${ativo ? ROXO : LAVANDA_2}`,
                    background: ativo ? ROXO : "#fff", color: ativo ? "#fff" : TINTA,
                    borderRadius: 999, padding: "5px 12px 5px 5px", cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 700, fontSize: 12,
                  }}>
                    <Avatar nome={m.nome} />
                    {m.nome}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 8 }}>
              <IconeAnexo tamanho={14} /> ANEXOS E LINKS
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
              {cartao.anexos.length === 0 && (
                <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>Nenhum anexo ainda.</div>
              )}
              {cartao.anexos.map(a => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  background: LAVANDA, borderRadius: 12, padding: "8px 10px",
                }}>
                  <a href={a.url} target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700,
                    color: ROXO, textDecoration: "none", minWidth: 0, overflow: "hidden",
                  }}>
                    {a.tipo === "link" ? <IconeLink tamanho={14} /> : <IconeAnexo tamanho={14} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.nome || a.url}
                    </span>
                  </a>
                  <button onClick={() => excluirAnexo(a.id)} aria-label="Remover anexo" className="em-btn" style={{
                    border: "none", background: "transparent", cursor: "pointer", color: CINZA,
                    fontSize: 16, fontWeight: 800, padding: 0, flexShrink: 0,
                  }}>×</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <label className="em-btn" style={{
                display: "flex", alignItems: "center", gap: 6, border: `2px solid ${LAVANDA_2}`, borderRadius: 999,
                padding: "8px 14px", fontSize: 13, fontWeight: 700, color: ROXO, cursor: "pointer",
              }}>
                <IconeAnexo tamanho={14} /> Anexar arquivo
                <input type="file" onChange={enviarArquivo} style={{ display: "none" }} />
              </label>
            </div>
            <form onSubmit={enviarLink} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input value={link} onChange={e => setLink(e.target.value)} placeholder="Cole um link"
                style={{ ...campoEstilo, flex: 2, minWidth: 160 }} />
              <input value={nomeLink} onChange={e => setNomeLink(e.target.value)} placeholder="Nome (opcional)"
                style={{ ...campoEstilo, flex: 1, minWidth: 120 }} />
              <Botao pequeno type="submit">Adicionar link</Botao>
            </form>
            {erro && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 8 }}>
              <IconeComentario tamanho={14} /> COMENTÁRIOS
            </div>
            <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
              {cartao.comentarios.length === 0 && (
                <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>Nenhum comentário ainda.</div>
              )}
              {cartao.comentarios.map(c => (
                <div key={c.id} style={{ background: LAVANDA, borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: ROXO }}>{c.autorNome}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: CINZA }}>
                      {new Date(c.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: TINTA, fontWeight: 600, marginTop: 4, whiteSpace: "pre-wrap" }}>{c.texto}</div>
                </div>
              ))}
            </div>
            <form onSubmit={enviarComentario} style={{ display: "grid", gap: 8 }}>
              <textarea
                value={comentario} onChange={e => setComentario(e.target.value)}
                placeholder="Escreva um comentário pro squad" rows={2}
                style={{ ...campoEstilo, resize: "vertical" }}
              />
              <div><Botao pequeno type="submit">Comentar</Botao></div>
            </form>
          </div>

          <div style={{ borderTop: `1px solid ${LAVANDA_2}`, paddingTop: 14 }}>
            <Botao pequeno variante="perigo" onClick={excluirCartao}>Excluir cartão</Botao>
          </div>
        </Cartao>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const [quadros, setQuadros] = useState([]);
  const [quadroAtivoId, setQuadroAtivoId] = useState(null);
  const [colunas, setColunas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [membrosDisponiveis, setMembrosDisponiveis] = useState([]);
  const [colunaComForm, setColunaComForm] = useState(null);
  const [colunaEditando, setColunaEditando] = useState(null);
  const [cartaoAbertoId, setCartaoAbertoId] = useState(null);
  const [toast, setToast] = useState("");
  const [carregando, setCarregando] = useState(true);

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    api.listarQuadrosKanban().then(({ quadros }) => {
      setQuadros(quadros);
      setQuadroAtivoId(atual => atual || quadros[0]?.id || null);
    });
  }, []);

  const carregarCartoes = () => {
    if (!quadroAtivoId) return;
    api.listarCartoesKanban(quadroAtivoId).then(({ cartoes }) => setCartoes(cartoes));
  };

  const carregarColunas = () => {
    if (!quadroAtivoId) return;
    api.listarColunasKanban(quadroAtivoId).then(({ colunas }) => setColunas(colunas));
  };

  useEffect(() => {
    if (!quadroAtivoId) return;
    setCarregando(true);
    Promise.all([
      api.listarCartoesKanban(quadroAtivoId),
      api.listarMembrosQuadroKanban(quadroAtivoId),
      api.listarColunasKanban(quadroAtivoId),
    ]).then(([c, m, col]) => {
      setCartoes(c.cartoes);
      setMembrosDisponiveis(m.membros);
      setColunas(col.colunas);
    }).finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quadroAtivoId]);

  const criarCartao = async (coluna, titulo, prazo) => {
    await api.criarCartaoKanban(quadroAtivoId, { titulo, coluna, prazo: prazo || null });
    setColunaComForm(null);
    carregarCartoes();
  };

  const moverCartao = async (cartaoId, novaColuna) => {
    setCartoes(cs => cs.map(c => (c.id === cartaoId ? { ...c, coluna: novaColuna } : c)));
    try {
      await api.atualizarCartaoKanban(cartaoId, { coluna: novaColuna });
    } catch {
      carregarCartoes();
    }
  };

  const salvarColuna = async (colunaKey, nome, cor) => {
    await api.atualizarColunaKanban(quadroAtivoId, colunaKey, { nome, cor });
    setColunaEditando(null);
    carregarColunas();
    mostrar("✓ Coluna atualizada");
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA, display: "flex" }}>
      <NavLateral usuario={usuario} aoSair={() => { sair(); navigate("/"); }} />

      <main className="ez-conteudo-com-sidebar" style={{ flex: 1, minWidth: 0, maxWidth: 1400, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Kanban</h1>
            <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
              Organize os processos da sua operação, do pedido à entrega.
            </p>
          </div>
          {quadros.length > 1 && (
            <div style={{ display: "flex", gap: 6, background: "#fff", borderRadius: 999, padding: 4, border: `1px solid ${LAVANDA_2}` }}>
              {quadros.map(q => (
                <button key={q.id} onClick={() => setQuadroAtivoId(q.id)} className="em-btn" style={{
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 800, fontSize: 13, padding: "9px 16px", borderRadius: 999,
                  background: quadroAtivoId === q.id ? ROXO : "transparent",
                  color: quadroAtivoId === q.id ? "#fff" : CINZA,
                }}>{q.nome}</button>
              ))}
            </div>
          )}
        </div>

        {!carregando && (
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 10 }}>
            {colunas.map(coluna => {
              const cartoesDaColuna = cartoes.filter(c => c.coluna === coluna.coluna);
              return (
                <div
                  key={coluna.coluna}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    const id = Number(e.dataTransfer.getData("text/plain"));
                    if (id) moverCartao(id, coluna.coluna);
                  }}
                  style={{
                    background: LAVANDA_2, borderRadius: 18, padding: 12,
                    minWidth: 260, width: 260, flexShrink: 0, display: "grid", gap: 10, alignContent: "start",
                  }}
                >
                  {colunaEditando === coluna.coluna ? (
                    <EditarColuna
                      coluna={coluna}
                      aoSalvar={(nome, cor) => salvarColuna(coluna.coluna, nome, cor)}
                      aoCancelar={() => setColunaEditando(null)}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <BolinhaCor cor={coluna.cor} />
                        <span style={{
                          fontSize: 13, fontWeight: 800, color: TINTA, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{coluna.nome}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, color: CINZA, background: "#fff",
                          borderRadius: 999, padding: "2px 8px",
                        }}>{cartoesDaColuna.length}</span>
                        <button
                          onClick={() => setColunaEditando(coluna.coluna)} aria-label="Editar coluna" className="em-btn"
                          style={{
                            border: "none", background: "transparent", cursor: "pointer", color: CINZA,
                            padding: 4, display: "flex",
                          }}
                        ><IconeLapis tamanho={13} /></button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gap: 8 }}>
                    {cartoesDaColuna.map(cartao => (
                      <CartaoMini key={cartao.id} cartao={cartao} aoAbrir={setCartaoAbertoId} aoArrastar={() => {}} />
                    ))}
                  </div>

                  {colunaComForm === coluna.coluna ? (
                    <NovoCartaoForm
                      aoCriar={(titulo, prazo) => criarCartao(coluna.coluna, titulo, prazo)}
                      aoCancelar={() => setColunaComForm(null)}
                    />
                  ) : (
                    <button onClick={() => setColunaComForm(coluna.coluna)} className="em-btn" style={{
                      display: "flex", alignItems: "center", gap: 6, border: "none", background: "transparent",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: CINZA, padding: 4,
                    }}>
                      <IconeMais tamanho={14} /> Novo cartão
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!carregando && cartoes.length === 0 && (
          <Cartao style={{ textAlign: "center", padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", color: CINZA, marginBottom: 6 }}>
              <IconeAlerta tamanho={28} />
            </div>
            <div style={{ fontWeight: 800, color: TINTA, fontSize: 15 }}>Nenhum cartão ainda</div>
            <div style={{ color: CINZA, fontWeight: 600, fontSize: 13 }}>
              Clique em "Novo cartão" em qualquer coluna pra começar.
            </div>
          </Cartao>
        )}
      </main>

      {cartaoAbertoId && (
        <DetalheCartao
          cartaoId={cartaoAbertoId}
          membrosDisponiveis={membrosDisponiveis}
          colunas={colunas}
          aoFechar={() => setCartaoAbertoId(null)}
          aoMudou={() => { carregarCartoes(); mostrar("✓ Cartão atualizado"); }}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
