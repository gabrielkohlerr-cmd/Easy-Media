import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LAVANDA_2, ROXO } from "./theme.js";
import { Marca } from "./components.jsx";
import {
  IconeCasa, IconeCaixaEntrada, IconeCalendario, IconeAgenda, IconeKanban,
  IconePredio, IconeUsuarios, IconePrancheta, IconeEstrela,
} from "./icones.jsx";

function itensParaUsuario(usuario) {
  if (!usuario) return [];
  if (usuario.tipo === "agencia") {
    return [
      { rotulo: "Squad e clientes", rota: "/agencia", Icone: IconePredio },
      { rotulo: "Squad", rota: "/squad", Icone: IconeUsuarios },
      { rotulo: "Painel de conteúdo", rota: "/painel", Icone: IconeCaixaEntrada },
      { rotulo: "Calendário", rota: "/calendario", Icone: IconeCalendario },
      { rotulo: "Agenda", rota: "/agenda", Icone: IconeAgenda },
      { rotulo: "Kanban", rota: "/kanban", Icone: IconeKanban },
      { rotulo: "Planos", rota: "/planos", Icone: IconeEstrela },
    ];
  }
  return [
    { rotulo: "Início", rota: "/inicio", Icone: IconeCasa },
    { rotulo: "Clientes", rota: "/clientes", Icone: IconePrancheta },
    { rotulo: "Painel de conteúdo", rota: "/painel", Icone: IconeCaixaEntrada },
    { rotulo: "Calendário", rota: "/calendario", Icone: IconeCalendario },
    { rotulo: "Agenda", rota: "/agenda", Icone: IconeAgenda },
    { rotulo: "Kanban", rota: "/kanban", Icone: IconeKanban },
    { rotulo: "Planos", rota: "/planos", Icone: IconeEstrela },
  ];
}

export default function NavLateral({ usuario, aoSair }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [aberta, setAberta] = useState(false);
  const itens = itensParaUsuario(usuario);

  const ir = rota => {
    navigate(rota);
    setAberta(false);
  };

  return (
    <>
      <button
        onClick={() => setAberta(a => !a)} aria-label="Abrir menu" className="em-btn ez-toggle-sidebar"
        style={{
          border: "none", background: "rgba(0,0,0,.9)", color: "#fff", width: 42, height: 42,
          borderRadius: 12, cursor: "pointer", fontSize: 18, alignItems: "center", justifyContent: "center",
        }}
      >☰</button>

      {aberta && (
        <div
          onClick={() => setAberta(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40 }}
        />
      )}

      <aside className={`ez-sidebar${aberta ? " aberta" : ""}`} style={{
        width: 240, minHeight: "100vh", height: "100vh", background: "rgba(0,0,0,.94)",
        borderRight: "1px solid rgba(255,255,255,.1)", padding: "22px 14px",
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, alignSelf: "flex-start", overflowY: "auto",
      }}>
        <div style={{ padding: "0 6px", marginBottom: 26 }}><Marca tamanho={32} /></div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {itens.map(item => {
            const ativo = location.pathname === item.rota;
            return (
              <button
                key={item.rota} onClick={() => ir(item.rota)} className="em-btn" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                  border: "none", background: ativo ? "rgba(255,255,255,.12)" : "transparent",
                  color: ativo ? "#fff" : "rgba(255,255,255,.68)", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%",
                }}
              >
                <item.Icone tamanho={17} />
                {item.rotulo}
              </button>
            );
          })}
        </nav>

        <div style={{
          marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)",
          display: "grid", gap: 4,
        }}>
          <button onClick={() => ir("/perfil")} className="em-btn" style={{
            display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent",
            cursor: "pointer", fontFamily: "inherit", padding: "8px 12px", borderRadius: 12,
            color: location.pathname === "/perfil" ? "#fff" : "rgba(255,255,255,.68)",
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: "50%", overflow: "hidden", background: LAVANDA_2,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: ROXO, flexShrink: 0,
            }}>
              {usuario?.foto_perfil_url
                ? <img src={usuario.foto_perfil_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : usuario?.nome?.[0]?.toUpperCase()}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {usuario?.nome}
            </span>
          </button>
          <button onClick={aoSair} className="em-btn" style={{
            border: "none", background: "transparent", cursor: "pointer", textAlign: "left",
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,.55)",
            padding: "6px 12px",
          }}>Sair</button>
        </div>
      </aside>
    </>
  );
}
