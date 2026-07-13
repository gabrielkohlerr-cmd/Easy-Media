import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ROXO, ROXO_ESCURO, ROXO_CLARO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA,
} from "./theme.js";
import { Pill, Botao, Cartao, Toast, Marca, BotaoWhatsApp } from "./components.jsx";
import {
  IconeAlvo, IconePredio, IconePrancheta, IconePasta, IconeAprovacao, IconeEnvio,
  IconeCalendario, IconeGrafico, IconeIA, IconeGoogleAgenda, IconeKanban, IconeCheck, IconeX,
} from "./icones.jsx";
import { useAuth } from "./AuthContext.jsx";

/* ============ EZ MEDIA — página de login / captação ============
   Landing + login voltada a converter agências e social medias
   freelancers, com CTAs segmentadas por perfil.
   Conteúdo baseado no direcionamento estratégico da marca.
===================================================================== */

const PERSONAS = [
  {
    id: "social_media",
    Icone: IconeAlvo,
    titulo: "Sou Social Media",
    texto: "Controle clientes, prazos e aprovações num só lugar.",
    cta: "Quero ser Social Media",
    rotuloNegocio: "Nome do seu negócio (opcional)",
  },
  {
    id: "agencia",
    agencia: true,
    Icone: IconePredio,
    titulo: "Sou Agência",
    texto: "Organize equipe, clientes e processos pra crescer sem bagunça.",
    cta: "Cadastrar minha agência",
    rotuloNegocio: "Nome da agência",
  },
];

const JORNADA = [
  "Planejamento", "Produção", "Aprovação", "Publicação", "Resultados",
];

const ANTES = [
  "Informações perdidas entre conversas",
  "Retrabalho e prazos perdidos",
  "Aprovação bagunçada no WhatsApp",
  "Ferramentas demais, controle de menos",
];

const DEPOIS = [
  "Tudo num único ambiente",
  "Cada um sabe o que fazer",
  "Cliente aprova numa página só",
  "Aprovou, publicação automática",
];

const AREAS = [
  {
    Icone: IconePasta,
    titulo: "Gestão de conteúdos",
    texto: "Textos, arquivos e datas num só lugar.",
  },
  {
    Icone: IconeAprovacao,
    titulo: "Aprovação de publicações",
    texto: "O cliente aprova numa página só dele.",
  },
  {
    Icone: IconeEnvio,
    titulo: "Agendamento e publicação",
    texto: "Aprovado, publica direto no Instagram.",
  },
  {
    Icone: IconeCalendario,
    titulo: "Calendário editorial",
    texto: "Todas as postagens do mês, organizadas.",
  },
  {
    Icone: IconeGrafico,
    titulo: "Área de resultados",
    texto: "Desempenho acessível pro cliente.",
  },
  {
    Icone: IconeIA,
    titulo: "Inteligência artificial",
    texto: "Sugestões de formato e horário, a seu favor.",
  },
  {
    Icone: IconeGoogleAgenda,
    titulo: "Integração com Google Agenda",
    texto: "Reuniões e entregas na rotina do cliente.",
  },
  {
    Icone: IconeKanban,
    titulo: "Gestão em Kanban",
    texto: "Veja o que está parado, e quem é responsável.",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Henrique Lyra", cargo: "Social Media Freelancer", topico: "Centralização das tarefas",
    texto: "Cuido de vários clientes sozinho. Antes era planilha pra cada um, hoje é tudo num só lugar. Enxergo minha semana inteira de novo.",
  },
  {
    nome: "Eduarda Dijck", cargo: "Atendimento Publicitário na Agência UM", topico: "Comunicação com cliente",
    texto: "Antes, aprovação era e-mail sem fim. Hoje o cliente vê e aprova direto na plataforma, sem ruído na comunicação.",
  },
  {
    nome: "Guilherme Rego", cargo: "Marketing na BG Promoções", topico: "Organização da equipe",
    texto: "Nosso time cresceu e ficou difícil saber quem fazia o quê. A EZ Media deixou claro o responsável por cada entrega.",
  },
  {
    nome: "Manuela Godoy", cargo: "Analista de Marketing Jr na Viva do Brasil", topico: "Automação nas postagens",
    texto: "Eu aprovo o post e pronto. Ele vai pro Instagram sozinho, no horário certo. Não preciso mais cobrar ninguém.",
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

/* ---------- vídeo de fundo do hero ----------
   Toca em loop, sem áudio, um vídeo do escritório caótico com o momento em
   que a câmera revela a EZ Media na tela do publicitário calmo. Enquanto o
   arquivo de vídeo não é enviado (public/video/escritorio-caos.mp4), cai
   graciosamente pra um fundo em gradiente — sem quebrar o layout. */
function VideoHero() {
  const [falhou, setFalhou] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: ROXO_ESCURO }}>
      {!falhou && (
        <video
          autoPlay muted loop playsInline
          onError={() => setFalhou(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        >
          <source src="/video/escritorio-caos.mp4" type="video/mp4" />
        </video>
      )}
      {falhou && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 28% 22%, ${ROXO} 0%, ${ROXO_ESCURO} 55%, #000 100%)`,
        }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,.58) 55%, rgba(0,0,0,.9) 100%)",
      }} />
    </div>
  );
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
        <persona.Icone tamanho={28} style={{ color: ROXO }} />
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
        <IconePrancheta tamanho={28} style={{ color: ROXO }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ROXO }}>SOU CLIENTE</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TINTA }}>Acompanhar meus posts</h3>
        </div>
      </div>
      <p style={{ marginTop: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5 }}>
        Seu acesso é por um link único, enviado pela sua agência ou social media, sem senha.
        Ainda não recebeu? Deixe seu contato abaixo.
      </p>
      {enviado ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: ROXO }}>
          <IconeCheck tamanho={18} /> Recebemos seu contato, obrigado!
        </div>
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
    navigate(usuario.tipo === "agencia" ? "/agencia" : "/inicio");
  };

  return (
    <div style={{ minHeight: "100vh", background: ROXO_ESCURO }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(0,0,0,.88)",
        backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.1)",
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <Marca claro />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/painel")} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,.7)",
              textDecoration: "underline", padding: 0,
            }}>Ver demonstração</button>
            <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: "#fff", padding: 0,
            }}>Já tenho conta · Entrar</button>
            <Botao pequeno variante="claro" onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
          </div>
        </div>
      </header>

      {/* hero com vídeo */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: 560, display: "flex", alignItems: "center" }}>
        <VideoHero />
        <div style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 1080, margin: "0 auto",
          padding: "40px 20px",
        }}>
          <div style={{ maxWidth: 440, textAlign: "left" }}>
            <div style={{
              fontSize: "clamp(42px, 8vw, 78px)", fontWeight: 700,
              letterSpacing: "-2.5px", color: "#fff", lineHeight: 1,
            }}>
              Make it EZ.
            </div>
            <p style={{
              margin: "16px 0 0", fontSize: 15, fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", color: ROXO_CLARO,
            }}>
              Toda a sua operação. Um só lugar.
            </p>
            <div style={{ marginTop: 30 }}>
              <Botao grande variante="claro" onClick={() => scrollPara("cadastro")}>
                Elimine o caos da sua agência
              </Botao>
            </div>
          </div>
        </div>
      </section>

      {/* estatísticas — faixa bege */}
      <section style={{ background: LAVANDA }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "32px 20px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12,
        }}>
          {NUMEROS.map(([valor, rotulo]) => (
            <div key={rotulo} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: TINTA }}>{valor}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: CINZA, marginTop: 2 }}>{rotulo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* jornada — faixa preta */}
      <section style={{ background: ROXO_ESCURO, padding: "36px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.65)", fontWeight: 600, margin: "0 0 16px", fontSize: 14 }}>
            Do briefing ao resultado, numa jornada só.
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            {JORNADA.map((etapa, i) => (
              <React.Fragment key={etapa}>
                <Pill cor="#fff" bg="rgba(255,255,255,.1)">{etapa}</Pill>
                {i < JORNADA.length - 1 && <span style={{ color: "rgba(255,255,255,.4)", fontWeight: 700 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* antes / depois — faixa preta */}
      <section style={{ background: ROXO_ESCURO, padding: "8px 20px 56px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 28px" }}>
            De operação fragmentada pra um sistema
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <Cartao style={{ background: LAVANDA, border: "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: CINZA, marginBottom: 10, letterSpacing: "1px" }}>
                ANTES DA EZ MEDIA
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {ANTES.map(item => (
                  <div key={item} style={{ display: "flex", gap: 8, fontSize: 14, color: TINTA, fontWeight: 500 }}>
                    <IconeX tamanho={16} style={{ color: ROSA, marginTop: 2 }} /> {item}
                  </div>
                ))}
              </div>
            </Cartao>
            <Cartao style={{ background: "#000", border: "1px solid rgba(255,255,255,.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ROXO_CLARO, marginBottom: 10, letterSpacing: "1px" }}>
                DEPOIS DA EZ MEDIA
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {DEPOIS.map(item => (
                  <div key={item} style={{ display: "flex", gap: 8, fontSize: 14, color: "#fff", fontWeight: 500 }}>
                    <IconeCheck tamanho={16} style={{ color: ROXO_CLARO, marginTop: 2 }} /> {item}
                  </div>
                ))}
              </div>
            </Cartao>
          </div>
        </div>
      </section>

      {/* personas / cadastro — faixa bege */}
      <section id="cadastro" style={{ background: LAVANDA, padding: "48px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: TINTA, margin: 0 }}>
            Como você vai usar a EZ Media?
          </h2>
          <p style={{ textAlign: "center", color: CINZA, fontWeight: 500, margin: "8px 0 28px" }}>
            Escolha seu perfil e comece agora. O cadastro leva menos de 1 minuto.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {PERSONAS.map(p => (
              <Cartao key={p.id} style={{
                display: "flex", flexDirection: "column", background: ROXO_ESCURO,
                border: personaAtiva === p.id ? `2px solid ${ROXO_CLARO}` : "1px solid rgba(255,255,255,.12)",
              }}>
                <p.Icone tamanho={30} style={{ color: ROXO_CLARO }} />
                <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 700, color: "#fff" }}>{p.titulo}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,.68)", fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                  {p.texto}
                </p>
                <div style={{ marginTop: 18 }}>
                  <Botao variante="claro" onClick={() => setPersonaAtiva(p.id)}>{p.cta}</Botao>
                </div>
              </Cartao>
            ))}
            <Cartao style={{
              display: "flex", flexDirection: "column", background: ROXO_ESCURO,
              border: personaAtiva === "cliente" ? `2px solid ${ROXO_CLARO}` : "1px solid rgba(255,255,255,.12)",
            }}>
              <IconePrancheta tamanho={30} style={{ color: ROXO_CLARO }} />
              <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Sou Cliente</h3>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,.68)", fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                Aprove conteúdos e acompanhe resultados, sem complicação.
              </p>
              <div style={{ marginTop: 18 }}>
                <Botao variante="claro" onClick={() => setPersonaAtiva("cliente")}>Acompanhar meus posts</Botao>
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
        </div>
      </section>

      {/* áreas da plataforma — faixa preta */}
      <section id="areas" style={{ background: ROXO_ESCURO, padding: "48px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center" }}>
            Um sistema operacional pra gestão de social media
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.62)", textAlign: "center" }}>
            Não é uma funcionalidade isolada. É toda a operação conectada num só ambiente.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {AREAS.map(a => (
              <div key={a.titulo} style={{ background: "rgba(255,255,255,.06)", borderRadius: 18, padding: 16 }}>
                <a.Icone tamanho={26} style={{ color: ROXO_CLARO }} />
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15, marginTop: 10 }}>{a.titulo}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.62)", fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>
                  {a.texto}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* depoimento — faixa branca */}
      <section style={{ background: "#fff", padding: "48px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, color: TINTA, margin: "0 0 28px" }}>
            Quem usa, recomenda
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 16 }}>
            {DEPOIMENTOS.map(d => (
              <Cartao key={d.nome} style={{ display: "flex", flexDirection: "column" }}>
                <Pill cor={ROXO} bg={LAVANDA_2}>{d.topico}</Pill>
                <p style={{
                  margin: "14px 0 0", fontSize: 14, fontWeight: 600,
                  color: TINTA, lineHeight: 1.55, fontStyle: "italic", flex: 1,
                }}>
                  “{d.texto}”
                </p>
                <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: CINZA }}>
                  {d.nome} · {d.cargo}
                </div>
              </Cartao>
            ))}
          </div>
        </div>
      </section>

      {/* manifesto — faixa preta */}
      <section style={{ background: ROXO_ESCURO, padding: "56px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <p style={{
            margin: 0, fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,.7)",
            lineHeight: 1.7, fontStyle: "italic",
          }}>
            Menos ferramenta espalhada, mais estratégia.
          </p>
          <p style={{
            margin: "16px 0 0", fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.6,
          }}>
            Uma plataforma. Toda a operação.
          </p>
          <div style={{
            marginTop: 20, fontSize: 14, fontWeight: 700, letterSpacing: "2px",
            textTransform: "uppercase", color: ROXO_CLARO,
          }}>
            Make it EZ.
          </div>
        </div>
      </section>

      {/* CTA final — faixa preta */}
      <section style={{ background: ROXO_ESCURO, textAlign: "center", padding: "48px 20px 64px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
          Pronto pra simplificar sua operação?
        </h2>
        <p style={{ margin: "10px 0 22px", color: "rgba(255,255,255,.65)", fontWeight: 500 }}>
          Crie sua conta grátis e organize sua primeira fila de conteúdo hoje mesmo.
        </p>
        <Botao grande variante="claro" onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
      </section>

      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,.1)", padding: "20px", textAlign: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
          EZ Media © 2026 · Make it EZ · <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: ROXO_CLARO, padding: 0,
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
