import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ROXO, ROXO_ESCURO, ROXO_CLARO, LAVANDA, LAVANDA_2, TINTA, CINZA, VERDE, AMBAR, ROSA,
} from "./theme.js";
import { Pill, Botao, Cartao, Toast } from "./components.jsx";
import { api } from "./api.js";
import NovoPostForm from "./NovoPostForm.jsx";

/* ============ EASY MEDIA — protótipo funcional ============
   Roxo + branco · minimalista · tipografia bold arredondada
   Duas visões: Social Media (gestão) e Cliente (aprovação)
=============================================================== */

export const STATUS = {
  aguardando: { label: "Aguardando aprovação", cor: AMBAR, bg: "#FEF3C7" },
  agendado: { label: "Aprovado · Agendado", cor: VERDE, bg: "#D1FAE5" },
  publicado: { label: "Publicado", cor: ROXO, bg: LAVANDA_2 },
  alteracao: { label: "Alteração solicitada", cor: ROSA, bg: "#FFE4E6" },
};

export const TIPO_LABEL = { reels: "Reels", carrossel: "Carrossel", estatico: "Estático" };

export const POSTS_INICIAIS = [
  {
    id: 1, cliente: "Nakai Sushi", tipo: "Reels", emoji: "🍣",
    titulo: "Bastidores do combinado premium",
    legenda: "Do corte à montagem: o cuidado por trás de cada peça do nosso combinado premium. 🍣✨ #NakaiSushi",
    data: "15/07", hora: "19:00", status: "aguardando", feedback: "",
    grad: "linear-gradient(135deg,#7C3AED,#C4B5FD)",
  },
  {
    id: 2, cliente: "Nakai Sushi", tipo: "Carrossel", emoji: "🥢",
    titulo: "5 curiosidades sobre o salmão",
    legenda: "Você sabia? Arrasta pro lado e descubra 5 curiosidades sobre o salmão que servimos. →",
    data: "17/07", hora: "12:30", status: "aguardando", feedback: "",
    grad: "linear-gradient(135deg,#6D28D9,#A78BFA)",
  },
  {
    id: 3, cliente: "Nakai Sushi", tipo: "Estático", emoji: "🎌",
    titulo: "Promoção terça do temaki",
    legenda: "Terça é dia de temaki em dobro! Marca aquele amigo que nunca recusa. 🎌",
    data: "21/07", hora: "18:00", status: "aguardando", feedback: "",
    grad: "linear-gradient(135deg,#4C1D95,#8B5CF6)",
  },
  {
    id: 4, cliente: "Nakai Sushi", tipo: "Reels", emoji: "🔥",
    titulo: "Prato novo: hot filadélfia trufado",
    legenda: "Chegou o hot filadélfia trufado — crocante por fora, cremoso por dentro. 🔥",
    data: "11/07", hora: "19:00", status: "publicado", feedback: "",
    grad: "linear-gradient(135deg,#5B21B6,#C4B5FD)",
    metricas: { alcance: 18400, curtidas: 1240, comentarios: 96, salvos: 210 },
  },
  {
    id: 5, cliente: "CarolLe", tipo: "Carrossel", emoji: "👗",
    titulo: "Lookbook inverno — parte 2",
    legenda: "O inverno chegou com tudo na CarolLe. Deslize e escolha o seu favorito. 🧥",
    data: "16/07", hora: "11:00", status: "agendado", feedback: "",
    grad: "linear-gradient(135deg,#7C3AED,#DDD6FE)",
  },
];

const SERIE_MENSAL = [
  { p: "Sem 1", alcance: 12400, engajamento: 980 },
  { p: "Sem 2", alcance: 15100, engajamento: 1320 },
  { p: "Sem 3", alcance: 18400, engajamento: 1710 },
  { p: "Sem 4", alcance: 21900, engajamento: 2240 },
];
const SERIE_TRI = [
  { p: "Mai", alcance: 41200, engajamento: 3900 },
  { p: "Jun", alcance: 52700, engajamento: 5100 },
  { p: "Jul", alcance: 67800, engajamento: 6250 },
];
const SERIE_SEM = [
  { p: "Fev", alcance: 28000, engajamento: 2100 },
  { p: "Mar", alcance: 33500, engajamento: 2800 },
  { p: "Abr", alcance: 38900, engajamento: 3300 },
  { p: "Mai", alcance: 41200, engajamento: 3900 },
  { p: "Jun", alcance: 52700, engajamento: 5100 },
  { p: "Jul", alcance: 67800, engajamento: 6250 },
];
const POR_FORMATO = [
  { formato: "Reels", engajamento: 2840 },
  { formato: "Carrossel", engajamento: 1920 },
  { formato: "Estático", engajamento: 860 },
];

const INSIGHTS = [
  {
    icone: "📈", titulo: "Reels às 19h lideram",
    texto: "Os Reels publicados às 19h para a Nakai tiveram 42% mais alcance que a média. Mantenha esse horário nas próximas campanhas.",
  },
  {
    icone: "💬", titulo: "Legendas com pergunta engajam mais",
    texto: "Posts que terminam com pergunta geraram 2,1x mais comentários neste mês. Teste CTAs de conversa no próximo carrossel.",
  },
  {
    icone: "🎯", titulo: "Carrossel educativo salva mais",
    texto: "Conteúdo de curiosidades teve 3x mais salvamentos. Vale transformar em série quinzenal para a Nakai.",
  },
];

/* ---------- componentes específicos do painel ---------- */

function Stat({ rotulo, valor, detalhe, destaque }) {
  return (
    <Cartao style={{ flex: 1, minWidth: 150, background: destaque ? ROXO : "#fff" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: destaque ? "#DDD6FE" : CINZA }}>{rotulo}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: destaque ? "#fff" : TINTA, lineHeight: 1.2 }}>{valor}</div>
      {detalhe && <div style={{ fontSize: 12, fontWeight: 700, color: destaque ? "#C4B5FD" : VERDE }}>{detalhe}</div>}
    </Cartao>
  );
}

export function PreviaPost({ post, grande }) {
  const altura = grande ? 200 : 120;
  const midia = post.midias?.[0];

  if (midia) {
    return (
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", height: altura, background: TINTA }}>
        {midia.tipo === "video" ? (
          <video src={midia.url} controls={grande} muted playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <img src={midia.url} alt={post.titulo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        {post.midias.length > 1 && (
          <span style={{
            position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.55)",
            color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
          }}>1/{post.midias.length}</span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: post.grad || "linear-gradient(135deg,#7C3AED,#C4B5FD)", borderRadius: 20,
      height: altura, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: grande ? 56 : 36,
    }}>
      <span role="img" aria-label={post.tipo}>{post.emoji || "🖼️"}</span>
    </div>
  );
}

/* ---------- gráficos / relatório ---------- */

function Relatorio() {
  const [periodo, setPeriodo] = useState("mensal");
  const serie = periodo === "mensal" ? SERIE_MENSAL : periodo === "trimestral" ? SERIE_TRI : SERIE_SEM;
  const abas = [
    { id: "mensal", rotulo: "Mensal" },
    { id: "trimestral", rotulo: "Trimestral" },
    { id: "semestral", rotulo: "Semestral" },
  ];
  return (
    <Cartao>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>Desempenho · Nakai Sushi</h3>
        <div style={{ display: "flex", gap: 6, background: LAVANDA, borderRadius: 999, padding: 4 }}>
          {abas.map(a => (
            <button key={a.id} onClick={() => setPeriodo(a.id)} className="em-btn" style={{
              border: "none", cursor: "pointer", fontFamily: "inherit",
              fontWeight: 800, fontSize: 13, padding: "8px 16px", borderRadius: 999,
              background: periodo === a.id ? "#fff" : "transparent",
              color: periodo === a.id ? ROXO : CINZA,
              boxShadow: periodo === a.id ? "0 2px 8px rgba(109,40,217,.15)" : "none",
            }}>{a.rotulo}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 240, marginTop: 16 }}>
        <ResponsiveContainer>
          <LineChart data={serie} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={LAVANDA_2} vertical={false} />
            <XAxis dataKey="p" tick={{ fontSize: 12, fontWeight: 700, fill: CINZA }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CINZA }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, border: `1px solid ${LAVANDA_2}`, fontFamily: "inherit", fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 13, fontWeight: 700 }} />
            <Line type="monotone" dataKey="alcance" name="Alcance" stroke={ROXO} strokeWidth={3} dot={{ r: 4, fill: ROXO }} />
            <Line type="monotone" dataKey="engajamento" name="Engajamento" stroke={ROXO_CLARO} strokeWidth={3} strokeDasharray="6 6" dot={{ r: 4, fill: ROXO_CLARO }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ height: 200, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: CINZA, marginBottom: 4 }}>Engajamento por formato</div>
        <ResponsiveContainer>
          <BarChart data={POR_FORMATO} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={LAVANDA_2} vertical={false} />
            <XAxis dataKey="formato" tick={{ fontSize: 12, fontWeight: 700, fill: CINZA }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CINZA }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, border: `1px solid ${LAVANDA_2}`, fontFamily: "inherit", fontWeight: 700 }} />
            <Bar dataKey="engajamento" name="Engajamento" fill={ROXO} radius={[12, 12, 0, 0]} barSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Cartao>
  );
}

/* ---------- visão do social media ---------- */

function VisaoSocialMedia({ posts, clientes, podeCriarPost, mostrarFormulario, aoAbrirFormulario, aoFecharFormulario, aoPostCriado }) {
  const aguardando = posts.filter(p => p.status === "aguardando").length;
  const agendados = posts.filter(p => p.status === "agendado").length;
  const alteracoes = posts.filter(p => p.status === "alteracao");

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Stat rotulo="Aguardando aprovação" valor={aguardando} destaque />
        <Stat rotulo="Aprovados · agendados" valor={agendados} detalhe="publicação automática ativa" />
        <Stat rotulo="Publicados no mês" valor="12" detalhe="+3 vs. mês anterior" />
        <Stat rotulo="Taxa de aprovação" valor="87%" detalhe="+5 pts" />
      </div>

      {alteracoes.length > 0 && (
        <Cartao style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: ROSA }}>
            ✏️ Alterações solicitadas pelo cliente
          </h3>
          {alteracoes.map(p => (
            <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 18, padding: 12, marginBottom: 8 }}>
              <div style={{ width: 56, flexShrink: 0 }}><PreviaPost post={p} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{p.titulo}</div>
                <div style={{ fontSize: 13, color: CINZA, fontWeight: 600 }}>“{p.feedback}”</div>
              </div>
            </div>
          ))}
        </Cartao>
      )}

      {podeCriarPost && mostrarFormulario && (
        <NovoPostForm clientes={clientes} aoCriado={aoPostCriado} aoCancelar={aoFecharFormulario} />
      )}

      <Cartao>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>Fila de conteúdo</h3>
          {podeCriarPost && !mostrarFormulario && (
            <Botao pequeno onClick={aoAbrirFormulario} disabled={!clientes?.length}>
              + Novo post
            </Botao>
          )}
        </div>
        {podeCriarPost && !clientes?.length && (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: CINZA, fontWeight: 600 }}>
            Adicione um cliente na carteira antes de enviar o primeiro post.
          </p>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          {posts.map(p => {
            const s = STATUS[p.status];
            return (
              <div key={p.id} style={{
                display: "flex", gap: 14, alignItems: "center",
                padding: 12, borderRadius: 18, background: LAVANDA,
              }}>
                <div style={{ width: 64, flexShrink: 0 }}><PreviaPost post={p} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: ROXO }}>{p.cliente} · {TIPO_LABEL[p.tipo] || p.tipo}</div>
                  <div style={{ fontWeight: 800, color: TINTA, fontSize: 15 }}>{p.titulo}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>📅 {p.data} às {p.hora}</div>
                </div>
                <Pill cor={s.cor} bg={s.bg}>{s.label}</Pill>
              </div>
            );
          })}
        </div>
      </Cartao>

      <Cartao style={{ background: `linear-gradient(135deg, ${ROXO_ESCURO}, ${ROXO})` }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#fff" }}>💡 Insights para as próximas campanhas</h3>
        <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#DDD6FE" }}>
          Gerados a partir do desempenho real dos posts conectados ao Instagram.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {INSIGHTS.map((i, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,.12)", borderRadius: 18, padding: 14 }}>
              <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{i.icone} {i.titulo}</div>
              <div style={{ fontSize: 13, color: "#EDE9FE", fontWeight: 600, marginTop: 2 }}>{i.texto}</div>
            </div>
          ))}
        </div>
      </Cartao>

      <Relatorio />
    </div>
  );
}

/* ---------- visão do cliente ---------- */

export function VisaoCliente({ posts, aoAprovar, aoReprovar, nomeCliente = "Nakai Sushi" }) {
  const [feedbackAberto, setFeedbackAberto] = useState(null);
  const [texto, setTexto] = useState("");
  const doCliente = posts.filter(p => p.cliente === nomeCliente);
  const pendentes = doCliente.filter(p => p.status === "aguardando");
  const publicado = doCliente.find(p => p.status === "publicado" && p.metricas);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Cartao style={{ background: `linear-gradient(135deg, ${ROXO}, ${ROXO_CLARO})` }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>Olá, {nomeCliente} 👋</h2>
        <p style={{ margin: "4px 0 0", color: "#EDE9FE", fontWeight: 600, fontSize: 14 }}>
          Você tem {pendentes.length} {pendentes.length === 1 ? "post aguardando" : "posts aguardando"} sua aprovação.
          Aprovou? A publicação é agendada automaticamente no seu Instagram.
        </p>
      </Cartao>

      {pendentes.length === 0 && (
        <Cartao style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40 }}>{doCliente.length === 0 ? "📭" : "🎉"}</div>
          <div style={{ fontWeight: 800, color: TINTA, fontSize: 18 }}>
            {doCliente.length === 0 ? "Nenhum post enviado ainda" : "Tudo aprovado!"}
          </div>
          <div style={{ color: CINZA, fontWeight: 600, fontSize: 14 }}>
            {doCliente.length === 0
              ? "Assim que seu social media enviar um post, ele aparece aqui."
              : "Seus próximos posts já estão agendados."}
          </div>
        </Cartao>
      )}

      {pendentes.map(p => (
        <Cartao key={p.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Pill cor={ROXO} bg={LAVANDA_2}>{TIPO_LABEL[p.tipo] || p.tipo}</Pill>
            <span style={{ fontSize: 13, fontWeight: 800, color: CINZA }}>📅 {p.data} às {p.hora}</span>
          </div>
          <PreviaPost post={p} grande />
          <h3 style={{ margin: "14px 0 4px", fontSize: 17, fontWeight: 800, color: TINTA }}>{p.titulo}</h3>
          <p style={{ margin: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5 }}>{p.legenda}</p>

          {feedbackAberto === p.id ? (
            <div style={{ marginTop: 14 }}>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="O que você gostaria de alterar neste post?"
                style={{
                  width: "100%", boxSizing: "border-box", minHeight: 80,
                  borderRadius: 18, border: `2px solid ${LAVANDA_2}`,
                  padding: 14, fontFamily: "inherit", fontWeight: 600,
                  fontSize: 14, color: TINTA, resize: "vertical", outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Botao variante="perigo" pequeno onClick={() => {
                  if (!texto.trim()) return;
                  aoReprovar(p.id, texto.trim());
                  setTexto(""); setFeedbackAberto(null);
                }}>Enviar alteração</Botao>
                <Botao variante="fantasma" pequeno onClick={() => { setFeedbackAberto(null); setTexto(""); }}>Cancelar</Botao>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Botao variante="sucesso" onClick={() => aoAprovar(p.id)}>✓ Aprovar post</Botao>
              <Botao variante="perigo" onClick={() => setFeedbackAberto(p.id)}>Pedir alteração</Botao>
            </div>
          )}
        </Cartao>
      ))}

      {publicado && (
        <Cartao>
          <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800, color: TINTA }}>
            ⚡ Desempenho em tempo real
          </h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: LAVANDA, borderRadius: 18, padding: 12, marginBottom: 14 }}>
            <div style={{ width: 56, flexShrink: 0 }}><PreviaPost post={publicado} /></div>
            <div>
              <div style={{ fontWeight: 800, color: TINTA, fontSize: 14 }}>{publicado.titulo}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>Publicado em {publicado.data}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
            {[
              ["Alcance", publicado.metricas.alcance.toLocaleString("pt-BR")],
              ["Curtidas", publicado.metricas.curtidas.toLocaleString("pt-BR")],
              ["Comentários", publicado.metricas.comentarios],
              ["Salvos", publicado.metricas.salvos],
            ].map(([r, v]) => (
              <div key={r} style={{ background: LAVANDA, borderRadius: 18, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ROXO }}>{v}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>{r}</div>
              </div>
            ))}
          </div>
        </Cartao>
      )}

      <Relatorio />
    </div>
  );
}

/* ---------- app ---------- */

const CHAVE_ARMAZENAMENTO = "easymedia-posts";

function carregarPosts() {
  try {
    const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // localStorage indisponível ou dado corrompido: usa os dados iniciais
  }
  return POSTS_INICIAIS;
}

export default function EasyMedia({ usuario, aoSair, aoSairConta, aoAbrirAgencia, aoAbrirPerfil, aoAbrirClientes, aoAbrirCalendario }) {
  const podeVerVisaoCliente = !usuario || usuario.tipo === "agencia";
  const [visao, setVisao] = useState("sm");
  const [posts, setPosts] = useState(carregarPosts);
  const [clientesReais, setClientesReais] = useState([]);
  const [postsReais, setPostsReais] = useState([]);
  const [clienteVisualizado, setClienteVisualizado] = useState("");
  const [mostrarNovoPost, setMostrarNovoPost] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (usuario) return;
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(posts));
    } catch {
      // localStorage indisponível: segue apenas em memória
    }
  }, [posts, usuario]);

  const recarregarReal = () => {
    Promise.all([api.listarClientes(), api.listarPosts()]).then(([c, p]) => {
      setClientesReais(c.clientes);
      setPostsReais(p.posts);
      setClienteVisualizado(atual => atual || c.clientes[0]?.nome || "");
    });
  };

  useEffect(() => {
    if (usuario) recarregarReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const aprovarDemo = id => {
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, status: "agendado" } : p)));
    mostrar("✓ Post aprovado e agendado no Instagram");
  };

  const reprovarDemo = (id, feedback) => {
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, status: "alteracao", feedback } : p)));
    mostrar("Alteração enviada ao social media");
  };

  const reiniciar = () => {
    setPosts(POSTS_INICIAIS);
    mostrar("Dados de demonstração reiniciados");
  };

  const aprovarReal = async id => {
    await api.atualizarStatusPost(id, "agendado", null);
    mostrar("✓ Post aprovado e agendado no Instagram");
    recarregarReal();
  };

  const reprovarReal = async (id, feedback) => {
    await api.atualizarStatusPost(id, "alteracao", feedback);
    mostrar("Alteração enviada ao social media");
    recarregarReal();
  };

  const listaPosts = usuario ? postsReais : posts;
  const aoAprovar = usuario ? aprovarReal : aprovarDemo;
  const aoReprovar = usuario ? reprovarReal : reprovarDemo;

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
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {podeVerVisaoCliente ? (
              <div style={{ display: "flex", gap: 6, background: LAVANDA, borderRadius: 999, padding: 4 }}>
                {[
                  { id: "sm", rotulo: "Visão Social Media" },
                  { id: "cliente", rotulo: "Visão Cliente" },
                ].map(v => (
                  <button key={v.id} onClick={() => setVisao(v.id)} className="em-btn" style={{
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontWeight: 800, fontSize: 13, padding: "10px 18px", borderRadius: 999,
                    background: visao === v.id ? ROXO : "transparent",
                    color: visao === v.id ? "#fff" : CINZA,
                  }}>{v.rotulo}</button>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 800, color: TINTA }}>Visão Social Media</span>
            )}
            {usuario && visao === "cliente" && clientesReais.length > 1 && (
              <select
                value={clienteVisualizado} onChange={e => setClienteVisualizado(e.target.value)}
                style={{
                  borderRadius: 999, border: `2px solid ${LAVANDA_2}`, padding: "6px 12px",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: TINTA, outline: "none",
                }}
              >
                {clientesReais.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            )}

            {!usuario && (
              <button onClick={reiniciar} className="em-btn" title="Restaura os dados de demonstração originais" style={{
                border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: CINZA,
                textDecoration: "underline", padding: 0,
              }}>Reiniciar demo</button>
            )}

            {usuario ? (
              <>
                {usuario.tipo === "agencia" && aoAbrirAgencia && (
                  <Botao pequeno onClick={aoAbrirAgencia}>Squad e clientes</Botao>
                )}
                {usuario.tipo === "social_media" && aoAbrirClientes && (
                  <Botao pequeno onClick={aoAbrirClientes}>Clientes</Botao>
                )}
                {aoAbrirCalendario && (
                  <Botao pequeno variante="fantasma" onClick={aoAbrirCalendario}>📅 Calendário</Botao>
                )}
                <button onClick={aoAbrirPerfil} className="em-btn" style={{
                  display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent",
                  cursor: "pointer", fontFamily: "inherit", padding: 0,
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%", overflow: "hidden", background: LAVANDA_2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: ROXO, flexShrink: 0,
                  }}>
                    {usuario.foto_perfil_url
                      ? <img src={usuario.foto_perfil_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : usuario.nome?.[0]?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: CINZA }}>Olá, {usuario.nome}</span>
                </button>
                <button onClick={aoSairConta} className="em-btn" style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: CINZA,
                  textDecoration: "underline", padding: 0,
                }}>Sair</button>
              </>
            ) : (
              aoSair && (
                <button onClick={aoSair} className="em-btn" style={{
                  border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 12, color: CINZA,
                  textDecoration: "underline", padding: 0,
                }}>← Voltar ao site</button>
              )
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
        {visao === "sm"
          ? (
            <VisaoSocialMedia
              posts={listaPosts}
              clientes={clientesReais}
              podeCriarPost={!!usuario}
              mostrarFormulario={mostrarNovoPost}
              aoAbrirFormulario={() => setMostrarNovoPost(true)}
              aoFecharFormulario={() => setMostrarNovoPost(false)}
              aoPostCriado={() => {
                setMostrarNovoPost(false);
                mostrar("✓ Post enviado pro cliente aprovar");
                recarregarReal();
              }}
            />
          )
          : (
            <VisaoCliente
              posts={listaPosts}
              aoAprovar={aoAprovar}
              aoReprovar={aoReprovar}
              nomeCliente={usuario ? clienteVisualizado : undefined}
            />
          )}
      </main>

      <Toast msg={toast} />
    </div>
  );
}
