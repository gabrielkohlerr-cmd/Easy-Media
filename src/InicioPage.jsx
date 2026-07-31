import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, ROXO_ESCURO, ROXO_CLARO, LAVANDA, LAVANDA_2, TINTA, CINZA, VERDE, AMBAR, ROSA } from "./theme.js";
import { Botao, Cartao, Pill } from "./components.jsx";
import {
  IconeKanban, IconeCalendario, IconeAgenda, IconeRelogio, IconeGrafico, IconeIA, IconeLink, IconeCamera,
} from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { tendenciaDoDia, todasTendencias } from "./tendencias.js";
import { statusPrazo, rotuloPrazo } from "./prazos.js";
import NavLateral from "./NavLateral.jsx";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function chaveData(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function inicioDaSemana(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function ModalTodasTendencias({ segmentos, aoFechar }) {
  return (
    <div onClick={aoFechar} style={{
      position: "fixed", inset: 0, background: "rgba(23,19,16,.55)", zIndex: 100,
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, marginTop: 40 }}>
        <Cartao style={{ padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>Todas as tendências</h2>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 30, height: 30, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 15,
            }}>×</button>
          </div>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: CINZA, fontWeight: 600 }}>
            Todo o banco de sugestões por segmento, com a data em que cada uma foi destaque —
            use isso pra avaliar se ainda vale considerar ou se já ficou datada.
          </p>
          <div style={{ display: "grid", gap: 22 }}>
            {segmentos.map(seg => (
              <div key={seg}>
                <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 800, color: ROXO }}>{seg}</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {todasTendencias(seg).map((item, i) => (
                    <div key={i} style={{
                      background: LAVANDA, borderRadius: 14, padding: 12,
                      border: item.ehHoje ? `2px solid ${ROXO_CLARO}` : "none",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {item.ehHoje
                          ? <Pill cor="#fff" bg={ROXO_CLARO}>Tendência de hoje</Pill>
                          : <span style={{ fontSize: 11, fontWeight: 700, color: CINZA }}>
                              Destaque em {formatarData(item.ultimaVez)}
                            </span>}
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: TINTA, fontWeight: 600, lineHeight: 1.5 }}>
                        {item.texto}
                      </p>
                      <a href={item.link} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800,
                        color: ROXO, textDecoration: "none",
                      }}>
                        <IconeLink tamanho={12} /> Ver referências sobre isso
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  );
}

export default function InicioPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reunioes, setReunioes] = useState([]);
  const [totalCartoes, setTotalCartoes] = useState(0);
  const [cartoesAtencao, setCartoesAtencao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [insightsPorCliente, setInsightsPorCliente] = useState({});
  const [tendenciasAbertas, setTendenciasAbertas] = useState(false);

  const inicioSemana = useMemo(() => inicioDaSemana(new Date()), []);
  const diasSemana = useMemo(() => {
    const lista = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana);
      d.setDate(d.getDate() + i);
      lista.push(d);
    }
    return lista;
  }, [inicioSemana]);

  useEffect(() => {
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 7);

    Promise.all([
      api.listarClientes(),
      api.listarPosts(),
      api.listarReunioes(chaveData(inicioSemana), chaveData(fimSemana)),
      api.listarQuadrosKanban(),
    ]).then(async ([c, p, r, k]) => {
      setClientes(c.clientes);
      setPosts(p.posts);
      setReunioes(r.reunioes);

      const porQuadro = await Promise.all(k.quadros.map(async q => {
        const [{ cartoes }, { colunas }] = await Promise.all([
          api.listarCartoesKanban(q.id), api.listarColunasKanban(q.id),
        ]);
        const colunaPorChave = Object.fromEntries(colunas.map(col => [col.coluna, col]));
        return cartoes.map(ct => ({ ...ct, quadroNome: q.nome, colunaInfo: colunaPorChave[ct.coluna] }));
      }));
      const todosCartoes = porQuadro.flat();
      setTotalCartoes(todosCartoes.length);

      const emAtencao = todosCartoes
        .filter(ct => ct.coluna === "urgencia" || statusPrazo(ct.prazo)?.estado === "atrasado" || statusPrazo(ct.prazo)?.estado === "proximo")
        .sort((a, b) => {
          const da = a.prazo ? new Date(a.prazo) - new Date() : Infinity;
          const db_ = b.prazo ? new Date(b.prazo) - new Date() : Infinity;
          return da - db_;
        })
        .slice(0, 6);
      setCartoesAtencao(emAtencao);
    }).finally(() => setCarregando(false));
  }, [inicioSemana]);

  const postsPorDia = useMemo(() => {
    const mapa = {};
    posts.forEach(p => {
      if (!p.data) return;
      (mapa[p.data] ||= []).push(p);
    });
    return mapa;
  }, [posts]);

  const clientesComSegmento = clientes.filter(c => c.segmento);
  const segmentosDosClientes = [...new Set(clientesComSegmento.map(c => c.segmento))];
  const clientesConectados = clientesComSegmento.filter(c => c.instagram_conectado);

  // insights reais só existem pra clientes com Instagram conectado — busca
  // um a um (a API do Instagram não tem um endpoint em lote) e guarda o
  // resultado por cliente conforme cada chamada termina
  useEffect(() => {
    clientesConectados.forEach(c => {
      if (insightsPorCliente[c.id]) return;
      setInsightsPorCliente(atual => ({ ...atual, [c.id]: { carregando: true } }));
      api.insightsInstagramCliente(c.id)
        .then(dados => setInsightsPorCliente(atual => ({ ...atual, [c.id]: { carregando: false, ...dados } })))
        .catch(() => setInsightsPorCliente(atual => ({ ...atual, [c.id]: { carregando: false, erro: true } })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes]);

  if (carregando) return null;

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA, display: "flex" }}>
      <NavLateral usuario={usuario} aoSair={() => { sair(); navigate("/"); }} />

      <main className="ez-conteudo-com-sidebar" style={{ flex: 1, minWidth: 0, maxWidth: 1160, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Olá, {usuario?.nome?.split(" ")[0]}</h1>
          <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
            Aqui está o resumo da sua operação hoje.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {/* calendario semanal (mini) */}
          <Cartao style={{ display: "flex", flexDirection: "column", cursor: "pointer" }} onClick={() => navigate("/calendario")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <IconeCalendario tamanho={18} style={{ color: ROXO }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TINTA }}>Calendário da semana</h3>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {diasSemana.map(d => {
                const qtd = postsPorDia[chaveData(d)]?.length || 0;
                const hoje = chaveData(d) === chaveData(new Date());
                return (
                  <div key={chaveData(d)} style={{
                    flex: 1, textAlign: "center", borderRadius: 10, padding: "6px 2px",
                    background: hoje ? ROXO : "#fff", border: `1px solid ${LAVANDA_2}`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: hoje ? "#fff" : CINZA }}>{DIAS_SEMANA[d.getDay()]}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: hoje ? "#fff" : TINTA }}>{d.getDate()}</div>
                    {qtd > 0 && (
                      <div style={{
                        marginTop: 2, width: 6, height: 6, borderRadius: "50%",
                        background: hoje ? "#fff" : ROXO_CLARO, marginInline: "auto",
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: CINZA }}>
              {posts.filter(p => postsPorDia[p.data]).length} posts agendados essa semana. Clique pra ver o calendário completo.
            </p>
            <div style={{ marginTop: "auto" }}>
              <Botao pequeno variante="fantasma" onClick={() => navigate("/calendario")}>Ver calendário completo</Botao>
            </div>
          </Cartao>

          {/* agenda semanal (mini) */}
          <Cartao style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <IconeAgenda tamanho={18} style={{ color: ROXO }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TINTA }}>Agenda da semana</h3>
            </div>
            {reunioes.length === 0 ? (
              <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: CINZA }}>
                Nenhum compromisso marcado essa semana.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                {reunioes.slice(0, 4).map(r => {
                  const inicio = new Date(r.inicio);
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: TINTA }}>
                      <IconeRelogio tamanho={13} style={{ color: CINZA, flexShrink: 0 }} />
                      <span style={{ color: CINZA, flexShrink: 0 }}>
                        {DIAS_SEMANA[inicio.getDay()]} {String(inicio.getHours()).padStart(2, "0")}:{String(inicio.getMinutes()).padStart(2, "0")}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.titulo}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: "auto" }}>
              <Botao pequeno variante="fantasma" onClick={() => navigate("/agenda")}>Ver agenda completa</Botao>
            </div>
          </Cartao>
        </div>

        <Cartao>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconeKanban tamanho={18} style={{ color: ROXO }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TINTA }}>Kanban</h3>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>{totalCartoes} cartões no total</span>
          </div>
          {cartoesAtencao.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: CINZA }}>
              Nada urgente ou perto do prazo agora. Bom trabalho!
            </p>
          ) : (
            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              {cartoesAtencao.map(ct => {
                const prazoInfo = statusPrazo(ct.prazo);
                const corPrazo = prazoInfo?.estado === "atrasado" ? ROSA : prazoInfo?.estado === "proximo" ? AMBAR : CINZA;
                return (
                  <div key={ct.id} onClick={() => navigate("/kanban")} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    background: LAVANDA, borderRadius: 14, padding: "10px 14px", cursor: "pointer",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: ct.colunaInfo?.cor || CINZA, flexShrink: 0,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 800, color: TINTA, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{ct.titulo}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: CINZA }}>
                          {ct.quadroNome} · {ct.colunaInfo?.nome}
                        </div>
                      </div>
                    </div>
                    {ct.prazo && (
                      <span style={{ fontSize: 11, fontWeight: 800, color: corPrazo, whiteSpace: "nowrap" }}>
                        {rotuloPrazo(ct.prazo)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div>
            <Botao pequeno onClick={() => navigate("/kanban")}>Abrir Kanban</Botao>
          </div>
        </Cartao>

        <Cartao>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <IconeGrafico tamanho={18} style={{ color: ROXO }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TINTA }}>Insights dos seus clientes</h3>
          </div>
          {clientesComSegmento.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: CINZA }}>
              Cadastre o segmento e o nicho dos seus clientes na Carteira de clientes pra ver insights aqui.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {clientesComSegmento.map(c => {
                const dica = tendenciaDoDia(c.segmento, 2);
                const insights = insightsPorCliente[c.id];
                return (
                  <div key={c.id} style={{ background: LAVANDA, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{c.nome}</span>
                      <Pill cor={ROXO} bg="#fff">{c.segmento}</Pill>
                    </div>

                    {!c.instagram_conectado && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <IconeCamera tamanho={13} style={{ color: CINZA, flexShrink: 0 }} />
                        <button onClick={() => navigate("/clientes")} className="em-btn" style={{
                          border: "none", background: "transparent", cursor: "pointer", textAlign: "left",
                          fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: ROXO, textDecoration: "underline", padding: 0,
                        }}>Conecte o Instagram desse cliente pra ver insights reais</button>
                      </div>
                    )}

                    {c.instagram_conectado && insights?.carregando && (
                      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: CINZA }}>Carregando insights reais…</p>
                    )}

                    {c.instagram_conectado && !insights?.carregando && insights?.erro && (
                      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: CINZA }}>
                        Não deu pra carregar os insights reais agora.
                      </p>
                    )}

                    {c.instagram_conectado && !insights?.carregando && !insights?.erro && insights?.postsConsiderados === 0 && (
                      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: CINZA }}>
                        Instagram conectado, mas ainda sem posts publicados pra calcular insights.
                      </p>
                    )}

                    {c.instagram_conectado && !insights?.carregando && !insights?.erro && insights?.postsConsiderados > 0 && (
                      <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: ROXO }}>{insights.alcance.toLocaleString("pt-BR")}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: CINZA }}>alcance real</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: VERDE }}>{insights.engajamento.toLocaleString("pt-BR")}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: CINZA }}>engajamento real</div>
                        </div>
                      </div>
                    )}

                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: CINZA, lineHeight: 1.5 }}>
                      {dica.texto}
                    </p>
                    <a href={dica.link} target="_blank" rel="noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11, fontWeight: 800,
                      color: ROXO, textDecoration: "none",
                    }}>
                      <IconeLink tamanho={11} /> Ver referências sobre isso
                    </a>
                  </div>
                );
              })}
            </div>
          )}
          <p style={{ margin: "12px 0 0", fontSize: 11, fontWeight: 600, color: CINZA }}>
            Alcance e engajamento só aparecem quando o Instagram do cliente está conectado, e vêm direto da conta real dele.
          </p>
        </Cartao>

        <Cartao style={{ background: `linear-gradient(135deg, ${ROXO_ESCURO}, ${ROXO})` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconeIA tamanho={18} style={{ color: "#fff" }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Tendências de hoje</h3>
            </div>
            {segmentosDosClientes.length > 0 && (
              <Botao pequeno variante="fantasmaClaro" onClick={() => setTendenciasAbertas(true)}>Ver todas as tendências</Botao>
            )}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 600, color: "#DDD6FE" }}>
            Sugestões por segmento, atualizadas diariamente — adapte pro nicho de cada cliente abaixo.
          </p>
          {segmentosDosClientes.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#EDE9FE" }}>
              Cadastre o segmento dos seus clientes pra ver tendências relevantes aqui.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {segmentosDosClientes.map(seg => {
                const clientesDoSegmento = clientesComSegmento.filter(c => c.segmento === seg);
                const dica = tendenciaDoDia(seg);
                return (
                  <div key={seg} style={{ background: "rgba(255,255,255,.12)", borderRadius: 16, padding: 14 }}>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 4 }}>{seg}</div>
                    <div style={{ fontSize: 13, color: "#EDE9FE", fontWeight: 600, lineHeight: 1.5, marginBottom: 6 }}>
                      {dica.texto}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD" }}>
                        Vale pra: {clientesDoSegmento.map(c => c.nome).join(", ")}
                      </div>
                      <a href={dica.link} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800,
                        color: "#fff", textDecoration: "underline",
                      }}>
                        <IconeLink tamanho={11} /> Ver referências
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Cartao>
      </main>

      {tendenciasAbertas && (
        <ModalTodasTendencias segmentos={segmentosDosClientes} aoFechar={() => setTendenciasAbertas(false)} />
      )}
    </div>
  );
}
