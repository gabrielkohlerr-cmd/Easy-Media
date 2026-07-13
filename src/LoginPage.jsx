import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ROXO, ROXO_ESCURO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA,
} from "./theme.js";
import { Pill, Botao, Cartao, Toast } from "./components.jsx";
import { useAuth } from "./AuthContext.jsx";

/* ============ EASY MEDIA — página de login / captação ============
   Landing + login voltada a converter agências e social medias
   freelancers, com CTAs segmentadas por perfil.
====================================================================== */

const PERSONAS = [
  {
    id: "social_media",
    emoji: "🎯",
    titulo: "Sou Social Media",
    texto: "Centralize a aprovação de todos os seus clientes em um só lugar e feche mais contas mostrando resultado de verdade.",
    cta: "Quero ser Social Media",
    rotuloNegocio: "Nome do seu negócio (opcional)",
  },
  {
    id: "agencia",
    emoji: "🏢",
    titulo: "Sou Agência",
    texto: "Dê organização e visibilidade pro time inteiro, com relatório automático pra cada cliente da carteira.",
    cta: "Cadastrar minha agência",
    rotuloNegocio: "Nome da agência",
  },
];

const BENEFICIOS = [
  {
    icone: "⚡",
    titulo: "Aprovação em 1 clique",
    texto: "O cliente aprova ou pede alteração direto pelo link, sem grupo de WhatsApp perdido.",
  },
  {
    icone: "📊",
    titulo: "Relatórios automáticos",
    texto: "Alcance, engajamento e resultado prontos pra mostrar, sem montar print manualmente.",
  },
  {
    icone: "🗂️",
    titulo: "Fila de conteúdo organizada",
    texto: "Todos os posts de todos os clientes num só lugar, sem perder prazo de postagem.",
  },
  {
    icone: "🤝",
    titulo: "Mais autoridade no fechamento",
    texto: "Ofereça uma experiência profissional que ajuda a vender contratos maiores.",
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
      position: "fixed", inset: 0, background: "rgba(34,20,72,.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, zIndex: 100,
    }} onClick={aoFechar}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
        <Cartao style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TINTA }}>Entrar</h2>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 32, height: 32, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 16,
            }}>×</button>
          </div>
          <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              E-mail
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                style={{
                  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Senha
              <input
                type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{
                  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
                }}
              />
            </label>
            {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
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
          <div style={{ fontSize: 12, fontWeight: 800, color: ROXO }}>CADASTRO</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>{persona.titulo}</h3>
        </div>
      </div>
      <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Nome
            <input
              required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            E-mail
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Senha
            <input
              type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            {persona.rotuloNegocio}
            <input
              value={negocio} onChange={e => setNegocio(e.target.value)} placeholder="Opcional"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
        </div>
        {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
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
          <div style={{ fontSize: 12, fontWeight: 800, color: ROXO }}>SOU CLIENTE</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>Acompanhar meus posts</h3>
        </div>
      </div>
      <p style={{ marginTop: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5 }}>
        O acesso do cliente é feito por um link único, gerado pela sua agência ou social media
        dentro da Easy Media — não é preciso criar senha. Se ainda não recebeu esse link, deixe
        seu contato abaixo que a gente te ajuda a apresentar a ferramenta pra quem cuida da sua marca.
      </p>
      {enviado ? (
        <div style={{ fontWeight: 800, color: ROXO }}>✓ Recebemos seu contato, obrigado!</div>
      ) : (
        <form
          onSubmit={e => { e.preventDefault(); if (!nome.trim() || !contato.trim()) return; setEnviado(true); aoEnviar(); }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            Sua marca
            <input
              required value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da sua marca"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
            E-mail ou WhatsApp
            <input
              required value={contato} onChange={e => setContato(e.target.value)} placeholder="Como falamos com você"
              style={{
                borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "12px 14px",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none",
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("/painel")} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: CINZA,
              textDecoration: "underline", padding: 0,
            }}>Ver demonstração</button>
            <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
              border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 800, fontSize: 14, color: ROXO, padding: 0,
            }}>Já tenho conta · Entrar</button>
            <Botao pequeno onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px 80px" }}>
        {/* hero */}
        <section style={{ padding: "56px 0 40px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Pill cor={ROXO} bg={LAVANDA_2}>Para agências e social medias freelancers</Pill>
          </div>
          <h1 style={{
            margin: "0 auto", maxWidth: 720, fontSize: 42, lineHeight: 1.15,
            fontWeight: 900, letterSpacing: "-1px", color: TINTA,
          }}>
            Aprove, publique e prove resultado pros seus clientes —
            sem virar refém de grupo de WhatsApp.
          </h1>
          <p style={{
            margin: "20px auto 0", maxWidth: 560, fontSize: 17, fontWeight: 600,
            color: CINZA, lineHeight: 1.6,
          }}>
            A Easy Media organiza sua fila de conteúdo, deixa o cliente aprovar em 1 clique
            e gera relatórios automáticos — pra você fechar mais contas e parecer ainda
            mais profissional.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Botao grande onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
            <Botao grande variante="fantasma" onClick={() => scrollPara("beneficios")}>Ver como funciona</Botao>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12, marginTop: 48,
          }}>
            {NUMEROS.map(([valor, rotulo]) => (
              <Cartao key={rotulo} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: ROXO }}>{valor}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: CINZA, marginTop: 2 }}>{rotulo}</div>
              </Cartao>
            ))}
          </div>
        </section>

        {/* personas / CTA principal */}
        <section id="cadastro" style={{ padding: "40px 0" }}>
          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 900, color: TINTA, margin: 0 }}>
            Como você vai usar a Easy Media?
          </h2>
          <p style={{ textAlign: "center", color: CINZA, fontWeight: 600, margin: "8px 0 28px" }}>
            Escolha seu perfil e comece agora — o cadastro leva menos de 1 minuto.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {PERSONAS.map(p => (
              <Cartao key={p.id} style={{
                display: "flex", flexDirection: "column",
                border: personaAtiva === p.id ? `2px solid ${ROXO}` : `1px solid ${LAVANDA_2}`,
              }}>
                <span style={{ fontSize: 34 }}>{p.emoji}</span>
                <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 800, color: TINTA }}>{p.titulo}</h3>
                <p style={{ margin: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
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
              <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 800, color: TINTA }}>Sou Cliente</h3>
              <p style={{ margin: 0, fontSize: 14, color: CINZA, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
                Aprove os posts da sua marca em segundos, direto do celular — sem precisar entender de social media.
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

        {/* benefícios */}
        <section id="beneficios" style={{ padding: "40px 0" }}>
          <Cartao style={{ background: `linear-gradient(135deg, ${ROXO_ESCURO}, ${ROXO})` }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#fff", textAlign: "center" }}>
              Por que agências e freelancers estão migrando pra Easy Media
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: "#DDD6FE", textAlign: "center" }}>
              Tudo o que você precisa pra profissionalizar a gestão de social media dos seus clientes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {BENEFICIOS.map(b => (
                <div key={b.titulo} style={{ background: "rgba(255,255,255,.12)", borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 24 }}>{b.icone}</div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, marginTop: 8 }}>{b.titulo}</div>
                  <div style={{ fontSize: 13, color: "#EDE9FE", fontWeight: 600, marginTop: 4, lineHeight: 1.5 }}>
                    {b.texto}
                  </div>
                </div>
              ))}
            </div>
          </Cartao>
        </section>

        {/* depoimento */}
        <section style={{ padding: "16px 0 40px" }}>
          <Cartao style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 30 }}>💬</div>
            <p style={{
              margin: "12px auto 0", maxWidth: 560, fontSize: 17, fontWeight: 700,
              color: TINTA, lineHeight: 1.6, fontStyle: "italic",
            }}>
              “Depois que comecei a usar a Easy Media com os clientes, parei de perder
              tempo cobrando aprovação no Whats — e ainda fechei dois contratos novos
              mostrando o relatório automático.”
            </p>
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 800, color: CINZA }}>
              Marina Duarte · Social Media freelancer
            </div>
          </Cartao>
        </section>

        {/* CTA final */}
        <section style={{ textAlign: "center", padding: "8px 0 24px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: TINTA, margin: 0 }}>
            Pronto pra parar de perder tempo com aprovação manual?
          </h2>
          <p style={{ margin: "10px 0 22px", color: CINZA, fontWeight: 600 }}>
            Crie sua conta grátis e organize sua primeira fila de conteúdo hoje mesmo.
          </p>
          <Botao grande onClick={() => scrollPara("cadastro")}>Criar conta grátis</Botao>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${LAVANDA_2}`, padding: "20px", textAlign: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: CINZA }}>
          Easy Media © 2026 · <button onClick={() => setLoginAberto(true)} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 800, fontSize: 13, color: ROXO, padding: 0,
          }}>Já tenho conta</button>
        </span>
      </footer>

      {loginAberto && (
        <ModalLogin
          aoFechar={() => setLoginAberto(false)}
          aoEntrar={aoEntrarOuCadastrar}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
