import { ROXO, ROXO_ESCURO, LAVANDA_2, ROSA, VERDE, TINTA } from "./theme.js";

/* ---------- componentes base compartilhados ---------- */

const NUMERO_WHATSAPP = "5581991270871";

export function Marca({ tamanho = 40, claro = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: tamanho, height: tamanho, borderRadius: tamanho * 0.28, background: ROXO_ESCURO,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width={tamanho * 0.58} height={tamanho * 0.58} viewBox="0 0 100 100">
          <g stroke={LAVANDA_2} strokeWidth="13" strokeLinecap="round" fill="none">
            <path d="M20 30 Q52 30 60 50" />
            <path d="M20 50 L54 50" />
            <path d="M20 70 Q52 70 60 50" />
          </g>
          <path d="M56 27 L92 50 L56 73 Z" fill={LAVANDA_2} />
        </svg>
      </div>
      <span style={{
        fontWeight: 700, fontSize: tamanho * 0.5, letterSpacing: "-.5px",
        color: claro ? "#fff" : TINTA,
      }}>ez media</span>
    </div>
  );
}

export function BotaoWhatsApp() {
  return (
    <a
      href={`https://wa.me/${NUMERO_WHATSAPP}`} target="_blank" rel="noreferrer"
      aria-label="Falar no WhatsApp" title="Falar no WhatsApp" className="em-btn"
      style={{
        position: "fixed", bottom: 24, right: 24, width: 58, height: 58, borderRadius: "50%",
        background: ROXO_ESCURO, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)", zIndex: 40, textDecoration: "none",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48a9 9 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.61.14-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.63-.92-2.23-.24-.58-.49-.5-.67-.51h-.57a1.1 1.1 0 0 0-.8.37 3.36 3.36 0 0 0-1.05 2.5c0 1.47 1.06 2.9 1.21 3.1.15.2 2.09 3.2 5.08 4.48.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12.02 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.26 1.2 4.63L2.5 21.5l4.98-1.19a9.46 9.46 0 0 0 4.54 1.16h.01c5.24 0 9.5-4.25 9.5-9.5s-4.26-9.47-9.51-9.47Zm5.68 15.16a7.9 7.9 0 0 1-5.68 2.36h0a7.9 7.9 0 0 1-4.02-1.1l-.29-.17-2.96.79.79-2.88-.19-.3a7.86 7.86 0 0 1-1.21-4.2 7.9 7.9 0 0 1 13.48-5.6 7.86 7.86 0 0 1 2.32 5.6 7.9 7.9 0 0 1-2.24 5.5Z" />
      </svg>
    </a>
  );
}

export function Pill({ children, cor, bg }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 800, color: cor, background: bg,
      padding: "4px 12px", borderRadius: 999, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

export function Botao({ children, onClick, variante = "primario", pequeno, grande, type = "button", disabled }) {
  const estilos = {
    primario: { background: ROXO, color: "#fff", border: "none" },
    fantasma: { background: "transparent", color: ROXO, border: `2px solid ${LAVANDA_2}` },
    perigo: { background: "#FFF1F2", color: ROSA, border: "none" },
    sucesso: { background: VERDE, color: "#fff", border: "none" },
  }[variante];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="em-btn" style={{
      ...estilos, fontFamily: "inherit", fontWeight: 800,
      fontSize: pequeno ? 13 : grande ? 17 : 15,
      padding: pequeno ? "8px 16px" : grande ? "16px 30px" : "12px 22px",
      borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
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
