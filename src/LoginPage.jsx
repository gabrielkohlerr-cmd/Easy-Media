import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ROXO, ROXO_ESCURO, ROXO_CLARO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA,
} from "./theme.js";
import { Pill, Botao, Cartao, Toast, Marca, BotaoWhatsApp } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";

/* ============ EZ MEDIA — página de login / captação ============
   Landing + login voltada a converter agências e social medias
   freelancers, com CTAs segmentadas por perfil.
   Conteúdo baseado no direcionamento estratégico da marca.
===================================================================== */

const PERSONAS = [
  {
    id: "social_media",
    emoji: "🎯",
    titulo: "Sou Social Media",
    texto: "Você gerencia clientes diferentes e precisa controlar conteúdos, prazos, aprovações, reuniões e resultados sem depender de dez ferramentas ao mesmo tempo.",
    cta: "Quero ser Social Media",
    rotuloNegocio: "Nome do seu negócio (opcional)",
  },
  {
    id: "agencia",
    agencia: true,
    emoji: "🏢",
    titulo: "Sou Agência",
    texto: "Da pequena agência que quer estruturar processos à operação em crescimento que precisa ganhar escala sem aumentar o retrabalho — organize equipe e clientes num só lugar.",
    cta: "Cadastrar minha agência",
    rotuloNegocio: "Nome da agência",
  },
];

const JORNADA = [
  "Planejamento", "Produção", "Revisão", "Envio ao cliente",
  "Aprovação", "Agendamento", "Publicação", "Análise", "Otimização",
];

const ANTES = [
  "Perda de informações",
  "Falta de clareza sobre o status de cada conteúdo",
  "Aprovações e ajustes dispersos entre conversas",
  "Dificuldade pra controlar prazos",
  "Retrabalho operacional",
  "Cobranças constantes aos clientes",
  "Esquecimento de reuniões, captações e entregas",
  "Excesso de ferramentas e assinaturas",
];

const DEPOIS = [
  "Clientes, conteúdos, tarefas e compromissos num único ambiente",
  "A equipe entende o que precisa ser feito e quem é responsável",
  "O cliente sabe exatamente o que precisa aprovar",
  "Compromissos, reuniões e captações ficam organizados",
  "Conteúdo aprovado segue direto pra publicação",
  "Os resultados alimentam os próximos planejamentos",
];

const AREAS = [
  {
    icone: "🗂️",
    titulo: "Gestão de conteúdos",
    texto: "Organize as publicações de cada cliente reunindo texto, arquivos, formatos, datas, horários e responsáveis num só lugar.",
  },
  {
    icone: "✅",
    titulo: "Aprovação de publicações",
    texto: "O cliente aprova, reprova ou pede ajustes numa página só dele — tudo registrado na publicação, sem se perder em conversa.",
  },
  {
    icone: "📤",
    titulo: "Agendamento e publicação",
    texto: "Depois de aprovado, o conteúdo é publicado no perfil do cliente por integração direta com a API da Meta.",
  },
  {
    icone: "📅",
    titulo: "Calendário editorial",
    texto: "Cliente e equipe visualizam as postagens num calendário organizado, com clareza do planejamento do mês.",
  },
  {
    icone: "📊",
    titulo: "Área de resultados",
    texto: "Uma página acessível pra o cliente acompanhar o desempenho das publicações e campanhas.",
  },
  {
    icone: "🧠",
    titulo: "Inteligência artificial",
    texto: "IA que interpreta os dados de cada cliente e sugere formatos, temas, horários e oportunidades de otimização — uma ferramenta a favor do social media, não uma substituição dele.",
  },
  {
    icone: "🗓️",
    titulo: "Integração com Google Agenda",
    texto: "Reuniões, captações, apresentações e entregas organizadas dentro da rotina de cada cliente.",
  },
  {
    icone: "📋",
    titulo: "Gestão de processos em Kanban",
    texto: "Acompanhe o andamento de cada atividade — o que está parado, em andamento, e quem é o responsável.",
  },
];

const NUMEROS = [
  ["+300", "agências e freelancers"],
  ["12 mil", "posts aprovados"],
  ["98%", "aprovação no prazo"],
  ["4,9/5", "satisfação média"],
];

function scrollPara(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- modal de login ---------- */

function ModalLogin({ aoFechar, aoEntrar }) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await entrar(email, senha);
      aoEntrar(usuario);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(23,19,16,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, zIndex: 100,
    }} onClick={aoFechar}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
        <Cartao style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TINTA }}>Entrar</h2>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 32, height: 32, borderRadius: 999,
              cursor: "pointer", fontWeight: 700, color: CINZA, fontSize: 16,
            }}>×</button>
          </div>
          <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
              E-mail
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                style={{
                  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
              Senha
              <input
                type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{
                  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
                }}
              />
            </label>
            {erro && <div style={{ fontSize: 13, fontWeight: 600, color: ROSA }}>{erro}</div>}
            <Botao type="submit">{enviando ? "Entrando…" : "Entrar na minha conta"}</Botao>
          </form>
        </Cartao>
      </div>
    </div>
  );
}

/* ---------- formulário de cadastro por persona ---------- */

function FormularioCadastro({ persona, aoCadastrar }) {
  const { registrar } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [negocio, setNegocio] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const usuario = await registrar({
        nome, email, senha, tipo: persona.id, nomeNegocio: negocio,
      });
      aoCadastrar(usuario);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Cartao style={{ marginTop: 16, border: `2px solid ${ROXO}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{persona.emoji}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ROXO }}>CADASTRO</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TINTA }}>{persona.titulo}</h3>
        </div>
      </div>
      <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            Nome
            <input
              required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            E-mail
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            Senha
            <input
              type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            {persona.rotuloNegocio}
            <input
              value={negocio} onChange={e => setNegocio(e.target.value)} placeholder="Opcional"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
        </div>
        {erro && <div style={{ fontSize: 13, fontWeight: 600, color: ROSA }}>{erro}</div>}
        <Botao type="submit" grande>{enviando ? "Criando conta…" : `${persona.cta} →`}</Botao>
      </form>
    </Cartao>
  );
}

/* ---------- lead de cliente (sem conta própria: acesso é via link da agência/social media) ---------- */

function CartaoLeadCliente({ aoEnviar }) {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <Cartao style={{ marginTop: 16, border: `2px solid ${ROXO}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>🧾</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ROXO }}>SOU CLIENTE</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TINTA }}>Acompanhar meus posts</h3>
        </div>
      </div>
      <p style={{ marginTop: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5 }}>
        O acesso do cliente é feito por um link único, gerado pela sua agência ou social media
        dentro da EZ Media — não é preciso criar senha. Se ainda não recebeu esse link, deixe
        seu contato abaixo que a gente te ajuda a apresentar a ferramenta pra quem cuida da sua marca.
      </p>
      {enviado ? (
        <div style={{ fontWeight: 700, color: ROXO }}>✓ Recebemos seu contato, obrigado!</div>
      ) : (
        <form
          onSubmit={e => { e.preventDefault(); if (!nome.trim() || !contato.trim()) return; setEnviado(true); aoEnviar(); }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            Sua marca
            <input
              required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da sua marca"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, color: CINZA }}>
            E-mail ou WhatsApp
            <input
              required value={contato} onChange={e => setContato(e.target.value)} placeholder="Como falamos com você"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 600, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <Botao type="submit" grande>Enviar contato →</Botao>
          </div>
        </form>
      )}
    </Cartao>
  );
}

/* ---------- página ---------- */

export default function PaginaLogin() {
  const navigate = useNavigate();
  const [loginAberto, setLoginAberto] = useState(false);
  const [personaAtiva, setPersonaAtiva] = useState(null);
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const aoEntrarOuCadastrar = usuario => {
    setLoginAberto(false);
    setPersonaAtiva(null);
    navigate(usuario.tipo === "agencia" ? "/agencia" : "/painel");
  };

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(248,244,236,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <Marca />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/painel")} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: CINZA,
              textDecoration: "underline", padding: 0,
            }}>Ver demonstração</button>
            <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: ROXO, padding: 0,
            }}>Já tenho conta · Entrar</button>
            <Botao pequeno onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px 80px" }}>
        {/* hero */}
        <section style={{ padding: "56px 0 40px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Pill cor={ROXO} bg={LAVANDA_2}>O sistema operacional para social medias e agências</Pill>
          </div>
          <h1 style={{
            margin: "0 auto", maxWidth: 720, fontSize: 44, lineHeight: 1.12,
            fontWeight: 700, letterSpacing: "-1.5px", color: TINTA,
          }}>
            Toda a sua operação.<br />Um só lugar.
          </h1>
          <p style={{
            margin: "20px auto 0", maxWidth: 580, fontSize: 17, fontWeight: 500,
            color: CINZA, lineHeight: 1.6,
          }}>
            A EZ Media centraliza clientes, conteúdos, aprovações, calendários, tarefas,
            compromissos, publicações e resultados — pra você trocar tempo controlando
            ferramentas por tempo de estratégia.
          </p>
          <div style={{
            marginTop: 18, fontSize: 13, fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase", color: ROXO_CLARO,
          }}>
            Make it EZ.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <Botao grande onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
            <Botao grande variante="fantasma" onClick={() => scrollPara("areas")}>Ver como funciona</Botao>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12, marginTop: 48,
          }}>
            {NUMEROS.map(([valor, rotulo]) => (
              <Cartao key={rotulo} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: ROXO }}>{valor}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: CINZA, marginTop: 2 }}>{rotulo}</div>
              </Cartao>
            ))}
          </div>
        </section>

        {/* jornada */}
        <section style={{ padding: "8px 0 32px" }}>
          <p style={{ textAlign: "center", color: CINZA, fontWeight: 600, margin: "0 0 16px", fontSize: 14 }}>
            A EZ Media não é mais uma ferramenta isolada — ela conecta a jornada inteira do
            profissional, do primeiro briefing ao resultado final.
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            {JORNADA.map((etapa, i) => (
              <React.Fragment key={etapa}>
                <Pill cor={TINTA} bg="#fff">{etapa}</Pill>
                {i < JORNADA.length - 1 && <span style={{ color: CINZA, fontWeight: 700 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* antes / depois */}
        <section style={{ padding: "24px 0" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: TINTA, margin: 0 }}>
            De uma operação fragmentada pra um sistema
          </h2>
          <p style={{ textAlign: "center", color: CINZA, fontWeight: 500, margin: "8px 0 28px" }}>
            WhatsApp, planilhas, apresentações, Google Agenda, Trello — cada etapa num lugar
            diferente. A EZ Media reúne tudo isso numa única experiência.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <Cartao>
              <div style={{ fontSize: 12, fontWeight: 700, color: CINZA, marginBottom: 10, letterSpacing: "1px" }}>
                ANTES DA EZ MEDIA
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {ANTES.map(item => (
                  <div key={item} style={{ display: "flex", gap: 8, fontSize: 14, color: TINTA, fontWeight: 500 }}>
                    <span style={{ color: ROSA }}>✕</span> {item}
                  </div>
                ))}
              </div>
            </Cartao>
            <Cartao style={{ background: ROXO_ESCURO, border: "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ROXO_CLARO, marginBottom: 10, letterSpacing: "1px" }}>
                DEPOIS DA EZ MEDIA
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {DEPOIS.map(item => (
                  <div key={item} style={{ display: "flex", gap: 8, fontSize: 14, color: "#fff", fontWeight: 500 }}>
                    <span style={{ color: "#6EE7B7" }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </Cartao>
          </div>
        </section>

        {/* personas / CTA principal */}
        <section id="cadastro" style={{ padding: "40px 0" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: TINTA, margin: 0 }}>
            Como você vai usar a EZ Media?
          </h2>
          <p style={{ textAlign: "center", color: CINZA, fontWeight: 500, margin: "8px 0 28px" }}>
            Escolha seu perfil e comece agora — o cadastro leva menos de 1 minuto.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {PERSONAS.map(p => (
              <Cartao key={p.id} style={{
                display: "flex", flexDirection: "column",
                border: personaAtiva === p.id ? `2px solid ${ROXO}` : `1px solid ${LAVANDA_2}`,
              }}>
                <span style={{ fontSize: 34 }}>{p.emoji}</span>
                <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 700, color: TINTA }}>{p.titulo}</h3>
                <p style={{ margin: 0, fontSize: 14, color: CINZA, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                  {p.texto}
                </p>
                <div style={{ marginTop: 18 }}>
                  <Botao onClick={() => setPersonaAtiva(p.id)}>{p.cta}</Botao>
                </div>
              </Cartao>
            ))}
            <Cartao style={{
              display: "flex", flexDirection: "column",
              border: personaAtiva === "cliente" ? `2px solid ${ROXO}` : `1px solid ${LAVANDA_2}`,
            }}>
              <span style={{ fontSize: 34 }}>🧾</span>
              <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 700, color: TINTA }}>Sou Cliente</h3>
              <p style={{ margin: 0, fontSize: 14, color: CINZA, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                Aprove conteúdos, acompanhe calendários e compromissos, e entenda os resultados
                da sua marca de um jeito simples — sem precisar entender de social media.
              </p>
              <div style={{ marginTop: 18 }}>
                <Botao onClick={() => setPersonaAtiva("cliente")}>Acompanhar meus posts</Botao>
              </div>
            </Cartao>
          </div>

          {personaAtiva === "cliente" && (
            <CartaoLeadCliente aoEnviar={() => mostrar("✓ Contato enviado! Vamos te ajudar por aqui.")} />
          )}
          {(personaAtiva === "social_media" || personaAtiva === "agencia") && (
            <FormularioCadastro
              persona={PERSONAS.find(p => p.id === personaAtiva)}
              aoCadastrar={aoEntrarOuCadastrar}
            />
          )}
        </section>

        {/* áreas da plataforma */}
        <section id="areas" style={{ padding: "16px 0 40px" }}>
          <Cartao style={{ background: ROXO_ESCURO, border: "none" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" }}>
              Um sistema operacional pra gestão de social media
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 500, color: LAVANDA_2, textAlign: "center" }}>
              Não é uma funcionalidade isolada — é toda a operação conectada num só ambiente.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {AREAS.map(a => (
                <div key={a.titulo} style={{ background: "rgba(255,255,255,.08)", borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 24 }}>{a.icone}</div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginTop: 8 }}>{a.titulo}</div>
                  <div style={{ fontSize: 13, color: LAVANDA_2, fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>
                    {a.texto}
                  </div>
                </div>
              ))}
            </div>
          </Cartao>
        </section>

        {/* depoimento */}
        <section style={{ padding: "0 0 40px" }}>
          <Cartao style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 30 }}>💬</div>
            <p style={{
              margin: "12px auto 0", maxWidth: 560, fontSize: 17, fontWeight: 600,
              color: TINTA, lineHeight: 1.6, fontStyle: "italic",
            }}>
              “Depois que comecei a usar a EZ Media com os clientes, parei de perder
              tempo cobrando aprovação no Whats — e ainda fechei dois contratos novos
              mostrando o relatório automático.”
            </p>
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Marina Duarte · Social Media freelancer
            </div>
          </Cartao>
        </section>

        {/* manifesto */}
        <section style={{ padding: "0 0 40px" }}>
          <Cartao style={{ background: ROXO_ESCURO, border: "none", padding: 40, textAlign: "center" }}>
            <p style={{
              margin: "0 auto", maxWidth: 640, fontSize: 18, fontWeight: 500, color: LAVANDA_2,
              lineHeight: 1.8, fontStyle: "italic",
            }}>
              O marketing evoluiu. As ferramentas evoluíram. Mas a rotina de muitos social medias
              e agências continua dividida entre mensagens, apresentações, planilhas e plataformas
              que não se comunicam. No final, o profissional passa mais tempo controlando a
              operação do que pensando em estratégia.
            </p>
            <p style={{
              margin: "20px auto 0", maxWidth: 640, fontSize: 18, fontWeight: 700, color: "#fff",
              lineHeight: 1.6,
            }}>
              A EZ Media nasceu pra mudar essa realidade.<br />
              Uma plataforma. Toda a operação.
            </p>
            <div style={{
              marginTop: 20, fontSize: 14, fontWeight: 700, letterSpacing: "2px",
              textTransform: "uppercase", color: ROXO_CLARO,
            }}>
              Make it EZ.
            </div>
          </Cartao>
        </section>

        {/* CTA final */}
        <section style={{ textAlign: "center", padding: "8px 0 24px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: TINTA, margin: 0 }}>
            Pronto pra simplificar sua operação?
          </h2>
          <p style={{ margin: "10px 0 22px", color: CINZA, fontWeight: 500 }}>
            Crie sua conta grátis e organize sua primeira fila de conteúdo hoje mesmo.
          </p>
          <Botao grande onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${LAVANDA_2}`, padding: "20px", textAlign: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: CINZA }}>
          EZ Media © 2026 · Make it EZ · <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: ROXO, padding: 0,
          }}>Já tenho conta</button>
        </span>
      </footer>

      {loginAberto && (
        <ModalLogin
          aoFechar={() => setLoginAberto(false)}
          aoEntrar={aoEntrarOuCadastrar}
        />
      )}

      <BotaoWhatsApp />
      <Toast msg={toast} />
    </div>
  );
}
