import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROXO, ROXO_ESCURO, LAVANDA, LAVANDA_2, TINTA, CINZA, ROSA } from "./theme.js";
import { Botao, Cartao, Toast, Marca } from "./components.jsx";
import { IconeRelogio, IconePin, IconeGoogleAgenda } from "./icones.jsx";
import { api } from "./api.js";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const HORA_INICIO = 7;
const HORA_FIM = 21;
const PX_POR_HORA = 56;

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

function formatarIntervaloSemana(inicio) {
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  if (inicio.getMonth() === fim.getMonth()) {
    return `${inicio.getDate()} – ${fim.getDate()} de ${NOMES_MES[inicio.getMonth()]} de ${inicio.getFullYear()}`;
  }
  return `${inicio.getDate()} de ${NOMES_MES[inicio.getMonth()]} – ${fim.getDate()} de ${NOMES_MES[fim.getMonth()]} de ${fim.getFullYear()}`;
}

function paraDatetimeLocal(date) {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function paraGoogleUTC(isoLocal) {
  return new Date(isoLocal).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function linkGoogleAgenda(reuniao) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: reuniao.titulo,
    dates: `${paraGoogleUTC(reuniao.inicio)}/${paraGoogleUTC(reuniao.fim)}`,
    details: reuniao.descricao || "",
    location: reuniao.local || "",
  });
  if (reuniao.convidados?.length) params.set("add", reuniao.convidados.join(","));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const campoEstilo = {
  borderRadius: 14, border: `2px solid ${LAVANDA_2}`, padding: "10px 14px",
  fontFamily: "inherit", fontWeight: 700, fontSize: 14, color: TINTA, outline: "none", width: "100%",
  boxSizing: "border-box",
};

function ModalNovaReuniao({ inicioSugerido, aoCriar, aoFechar }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [local, setLocal] = useState("");
  const [inicio, setInicio] = useState(paraDatetimeLocal(inicioSugerido));
  const [fim, setFim] = useState(paraDatetimeLocal(new Date(inicioSugerido.getTime() + 60 * 60 * 1000)));
  const [convidadosTexto, setConvidadosTexto] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const submeter = async e => {
    e.preventDefault();
    setErro("");
    const convidados = convidadosTexto.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    setEnviando(true);
    try {
      await aoCriar({ titulo, descricao, local, inicio, fim, convidados });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div onClick={aoFechar} style={{
      position: "fixed", inset: 0, background: "rgba(34,20,72,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440 }}>
        <Cartao style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>Nova reunião</h2>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 30, height: 30, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 15,
            }}>×</button>
          </div>
          <form onSubmit={submeter} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Título
              <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Reunião com o cliente" style={campoEstilo} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
                Início
                <input required type="datetime-local" value={inicio} onChange={e => setInicio(e.target.value)} style={campoEstilo} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
                Fim
                <input required type="datetime-local" value={fim} onChange={e => setFim(e.target.value)} style={campoEstilo} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Local (opcional)
              <input value={local} onChange={e => setLocal(e.target.value)} placeholder="Google Meet, endereço..." style={campoEstilo} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Descrição (opcional)
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} style={{ ...campoEstilo, minHeight: 60, resize: "vertical" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: CINZA }}>
              Convidar pessoas externas (e-mails separados por vírgula)
              <input
                value={convidadosTexto} onChange={e => setConvidadosTexto(e.target.value)}
                placeholder="cliente@exemplo.com, outro@exemplo.com" style={campoEstilo}
              />
            </label>
            {erro && <div style={{ fontSize: 13, fontWeight: 700, color: ROSA }}>{erro}</div>}
            <Botao type="submit">{enviando ? "Criando…" : "Criar reunião"}</Botao>
          </form>
        </Cartao>
      </div>
    </div>
  );
}

function ModalDetalheReuniao({ reuniao, aoFechar, aoExcluir }) {
  const inicio = new Date(reuniao.inicio);
  const fim = new Date(reuniao.fim);
  const pad = n => String(n).padStart(2, "0");
  const horario = `${pad(inicio.getHours())}:${pad(inicio.getMinutes())} – ${pad(fim.getHours())}:${pad(fim.getMinutes())}`;

  return (
    <div onClick={aoFechar} style={{
      position: "fixed", inset: 0, background: "rgba(34,20,72,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420 }}>
        <Cartao style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TINTA }}>{reuniao.titulo}</h2>
            <button onClick={aoFechar} aria-label="Fechar" className="em-btn" style={{
              border: "none", background: LAVANDA, width: 30, height: 30, borderRadius: 999,
              cursor: "pointer", fontWeight: 800, color: CINZA, fontSize: 15, flexShrink: 0,
            }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: CINZA, marginBottom: 4 }}>
            <IconeRelogio tamanho={15} />
            {inicio.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} · {horario}
          </div>
          {reuniao.local && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: CINZA, marginBottom: 4 }}>
              <IconePin tamanho={15} /> {reuniao.local}
            </div>
          )}
          {reuniao.descricao && (
            <p style={{ fontSize: 14, color: TINTA, fontWeight: 600, lineHeight: 1.5, margin: "10px 0" }}>{reuniao.descricao}</p>
          )}
          {reuniao.convidados?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: CINZA, marginBottom: 4 }}>CONVIDADOS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {reuniao.convidados.map(email => (
                  <span key={email} style={{
                    fontSize: 12, fontWeight: 700, color: ROXO, background: LAVANDA_2,
                    padding: "4px 10px", borderRadius: 999,
                  }}>{email}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <a href={linkGoogleAgenda(reuniao)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Botao type="button">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconeGoogleAgenda tamanho={15} /> Adicionar ao Google Agenda
                </span>
              </Botao>
            </a>
            <Botao variante="perigo" onClick={() => aoExcluir(reuniao.id)}>Excluir</Botao>
          </div>
        </Cartao>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const navigate = useNavigate();
  const [inicioSemana, setInicioSemana] = useState(inicioDaSemana(new Date()));
  const [reunioes, setReunioes] = useState([]);
  const [novaReuniaoEm, setNovaReuniaoEm] = useState(null);
  const [reuniaoAberta, setReuniaoAberta] = useState(null);
  const [toast, setToast] = useState("");

  const mostrar = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const dias = useMemo(() => {
    const lista = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana);
      d.setDate(d.getDate() + i);
      lista.push(d);
    }
    return lista;
  }, [inicioSemana]);

  const carregar = () => {
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 7);
    api.listarReunioes(chaveData(inicioSemana), chaveData(fimSemana)).then(({ reunioes }) => setReunioes(reunioes));
  };

  useEffect(carregar, [inicioSemana]);

  const reunioesPorDia = useMemo(() => {
    const mapa = {};
    reunioes.forEach(r => {
      const chave = chaveData(new Date(r.inicio));
      (mapa[chave] ||= []).push(r);
    });
    return mapa;
  }, [reunioes]);

  const criarReuniao = async dados => {
    await api.criarReuniao(dados);
    setNovaReuniaoEm(null);
    mostrar("✓ Reunião criada");
    carregar();
  };

  const excluirReuniao = async id => {
    await api.removerReuniao(id);
    setReuniaoAberta(null);
    mostrar("Reunião excluída");
    carregar();
  };

  const horas = [];
  for (let h = HORA_INICIO; h <= HORA_FIM; h++) horas.push(h);

  const hoje = new Date();

  return (
    <div style={{ minHeight: "100vh", background: LAVANDA, color: TINTA }}>
      <header style={{
        position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(8px)", borderBottom: `1px solid ${LAVANDA_2}`,
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <Marca />
          <Botao pequeno variante="fantasma" onClick={() => navigate("/painel")}>Ver painel de conteúdo</Botao>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 20px 60px", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: TINTA }}>Agenda</h1>
            <p style={{ margin: "4px 0 0", color: CINZA, fontWeight: 600, fontSize: 14 }}>
              Suas reuniões, semana a semana.
            </p>
          </div>
          <Botao onClick={() => {
            const sugestao = new Date();
            sugestao.setMinutes(0, 0, 0);
            sugestao.setHours(sugestao.getHours() + 1);
            setNovaReuniaoEm(sugestao);
          }}>+ Nova reunião</Botao>
        </div>

        <Cartao style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: TINTA }}>{formatarIntervaloSemana(inicioSemana)}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setInicioSemana(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
              aria-label="Semana anterior" className="em-btn" style={{
                border: `2px solid ${LAVANDA_2}`, background: "#fff", width: 34, height: 34, borderRadius: 999,
                cursor: "pointer", fontWeight: 800, color: ROXO, fontSize: 16,
              }}>‹</button>
            <Botao pequeno variante="fantasma" onClick={() => setInicioSemana(inicioDaSemana(new Date()))}>Hoje</Botao>
            <button onClick={() => setInicioSemana(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
              aria-label="Próxima semana" className="em-btn" style={{
                border: `2px solid ${LAVANDA_2}`, background: "#fff", width: 34, height: 34, borderRadius: 999,
                cursor: "pointer", fontWeight: 800, color: ROXO, fontSize: 16,
              }}>›</button>
          </div>
        </Cartao>

        <Cartao style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", background: ROXO_ESCURO }}>
            <div />
            {dias.map(dia => {
              const ehHoje = chaveData(dia) === chaveData(hoje);
              return (
                <div key={chaveData(dia)} style={{ padding: "10px 4px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#DDD6FE" }}>{DIAS_SEMANA[dia.getDay()]}</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, borderRadius: "50%", fontSize: 13, fontWeight: 800, marginTop: 2,
                    background: ehHoje ? "#fff" : "transparent", color: ehHoje ? ROXO : "#fff",
                  }}>{dia.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)", maxHeight: 640, overflowY: "auto" }}>
            <div>
              {horas.map(h => (
                <div key={h} style={{ height: PX_POR_HORA, textAlign: "right", paddingRight: 8, position: "relative" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: CINZA, position: "relative", top: -7 }}>
                    {String(h).padStart(2, "0")}h
                  </span>
                </div>
              ))}
            </div>

            {dias.map(dia => {
              const chave = chaveData(dia);
              const reunioesDoDia = reunioesPorDia[chave] || [];
              return (
                <div
                  key={chave}
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const horaClicada = HORA_INICIO + y / PX_POR_HORA;
                    const sugestao = new Date(dia);
                    sugestao.setHours(Math.floor(horaClicada), horaClicada % 1 >= 0.5 ? 30 : 0, 0, 0);
                    setNovaReuniaoEm(sugestao);
                  }}
                  style={{
                    position: "relative", borderLeft: `1px solid ${LAVANDA_2}`, cursor: "pointer",
                    height: (HORA_FIM - HORA_INICIO + 1) * PX_POR_HORA,
                  }}
                >
                  {horas.map(h => (
                    <div key={h} style={{ height: PX_POR_HORA, borderBottom: `1px solid ${LAVANDA_2}` }} />
                  ))}
                  {reunioesDoDia.map(r => {
                    const ini = new Date(r.inicio);
                    const fim = new Date(r.fim);
                    const topo = (ini.getHours() + ini.getMinutes() / 60 - HORA_INICIO) * PX_POR_HORA;
                    const altura = Math.max(20, ((fim - ini) / 3600000) * PX_POR_HORA);
                    return (
                      <button
                        key={r.id}
                        onClick={e => { e.stopPropagation(); setReuniaoAberta(r); }}
                        className="em-btn"
                        style={{
                          position: "absolute", top: topo, left: 3, right: 3, height: altura,
                          background: ROXO, color: "#fff", border: "none", borderRadius: 8,
                          padding: "4px 6px", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                          textAlign: "left", cursor: "pointer", overflow: "hidden",
                        }}
                      >
                        {r.titulo}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Cartao>
      </main>

      {novaReuniaoEm && (
        <ModalNovaReuniao
          inicioSugerido={novaReuniaoEm}
          aoCriar={criarReuniao}
          aoFechar={() => setNovaReuniaoEm(null)}
        />
      )}
      {reuniaoAberta && (
        <ModalDetalheReuniao
          reuniao={reuniaoAberta}
          aoFechar={() => setReuniaoAberta(null)}
          aoExcluir={excluirReuniao}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
