import { ROXO, LAVANDA_2, ROSA, VERDE, TINTA } from "./theme.js";

/* ---------- componentes base compartilhados ---------- */

export function Pill({ children, cor, bg }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 800, color: cor, background: bg,
      padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function Botao({ children, onClick, variante = "primario", pequeno, grande, type = "button" }) {
  const estilos = {
    primario: { background: ROXO, color: "#fff", border: "none" },
    fantasma: { background: "transparent", color: ROXO, border: `2px solid ${LAVANDA_2}` },
    perigo: { background: "#FFF1F2", color: ROSA, border: "none" },
    sucesso: { background: VERDE, color: "#fff", border: "none" },
  }[variante];
  return (
    <button type={type} onClick={onClick} className="em-btn" style={{
      ...estilos, fontFamily: "inherit", fontWeight: 800,
      fontSize: pequeno ? 13 : grande ? 17 : 15,
      padding: pequeno ? "8px 16px" : grande ? "16px 30px" : "12px 22px",
      borderRadius: 999, cursor: "pointer",
    }}>{children}</button>
  );
}

export function Cartao({ children, style }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 24, padding: 20,
      border: `1px solid ${LAVANDA_2}`, ...style,
    }}>{children}</div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: TINTA, color: "#fff", fontWeight: 800, fontSize: 14,
      padding: "12px 24px", borderRadius: 999, zIndex: 50,
      boxShadow: "0 8px 24px rgba(34,20,72,.25)",
    }}>{msg}</div>
  );
}
