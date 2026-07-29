/* ---------- ícones minimalistas de traço único, uma só cor (currentColor) ----------
   Substituem emojis coloridos por um sistema visual consistente com a marca. */

function Svg({ tamanho = 20, className, style, children }) {
  return (
    <svg
      width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  );
}

export function IconeCasa(props) {
  return (
    <Svg {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  );
}

export function IconeCalendario(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.7h17" />
      <path d="M8 3v3.4M16 3v3.4" />
    </Svg>
  );
}

export function IconeAgenda(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12.5" r="8.3" />
      <path d="M12 8.2v4.5l3 2" />
    </Svg>
  );
}

export function IconePredio(props) {
  return (
    <Svg {...props}>
      <rect x="5" y="3.3" width="14" height="17.4" rx="1.4" />
      <path d="M9.3 20.7v-3.3h5.4v3.3" />
      <path d="M8.4 7.4h1.3M14.3 7.4h1.3M8.4 11h1.3M14.3 11h1.3M8.4 14.6h1.3M14.3 14.6h1.3" />
    </Svg>
  );
}

export function IconeAlvo(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconePrancheta(props) {
  return (
    <Svg {...props}>
      <rect x="5.5" y="4.3" width="13" height="17" rx="1.6" />
      <rect x="9" y="2.4" width="6" height="3" rx="1" fill="currentColor" stroke="none" />
      <path d="M8.3 10.6h7.4M8.3 14.1h7.4M8.3 17.6h4.4" />
    </Svg>
  );
}

export function IconePasta(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 6.8a1.6 1.6 0 0 1 1.6-1.6h4l1.8 2h8a1.6 1.6 0 0 1 1.6 1.6v8.6a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z" />
    </Svg>
  );
}

export function IconeAprovacao(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.2 12.4l2.6 2.6 5-5.4" />
    </Svg>
  );
}

export function IconeEnvio(props) {
  return (
    <Svg {...props}>
      <path d="M21 3 3 10.3l7.3 2.7L13 21 21 3Z" />
      <path d="M10.3 13 21 3" />
    </Svg>
  );
}

export function IconeGrafico(props) {
  return (
    <Svg {...props}>
      <path d="M4 20V12M11 20V5M18 20v-8" />
      <path d="M3 20.5h18" />
    </Svg>
  );
}

export function IconeIA(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.2v3M12 17.8v3M4.5 7l2.6 1.5M16.9 15.5l2.6 1.5M4.5 17l2.6-1.5M16.9 8.5l2.6-1.5" />
    </Svg>
  );
}

export function IconeGoogleAgenda(props) {
  return (
    <Svg {...props}>
      <rect x="3.3" y="5.3" width="13.6" height="14.4" rx="2" />
      <path d="M7 3v3.4M13.6 3v3.4M3.3 10h13.6" />
      <path d="M20.6 14.2a3.1 3.1 0 1 1-.9-2.2" />
      <path d="M20.6 9.4v2.6H18" />
    </Svg>
  );
}

export function IconeKanban(props) {
  return (
    <Svg {...props}>
      <rect x="3.3" y="4" width="5" height="16" rx="1.3" />
      <rect x="9.5" y="4" width="5" height="10.4" rx="1.3" />
      <rect x="15.7" y="4" width="5" height="13.2" rx="1.3" />
    </Svg>
  );
}

export function IconeCheck(props) {
  return (
    <Svg {...props}>
      <path d="M4.3 12.6 9 17.3 19.7 6.6" />
    </Svg>
  );
}

export function IconeX(props) {
  return (
    <Svg {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </Svg>
  );
}

export function IconeUsuarios(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.3" />
      <path d="M3.4 20c0-3.6 2.5-6.1 5.6-6.1s5.6 2.5 5.6 6.1" />
      <circle cx="17.3" cy="9" r="2.6" />
      <path d="M15.2 20c.2-2.7 1.8-4.7 4.1-5" />
    </Svg>
  );
}

export function IconeCamera(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2.3" />
      <path d="M8.2 7 9.6 4.5h4.8L15.8 7" />
      <circle cx="12" cy="13.6" r="3.6" />
    </Svg>
  );
}

export function IconeImagem(props) {
  return (
    <Svg {...props}>
      <rect x="3.3" y="4.3" width="17.4" height="15.4" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4 17.5 9 12l3.5 3.5L16 12l4.7 5" />
    </Svg>
  );
}

export function IconeLapis(props) {
  return (
    <Svg {...props}>
      <path d="M4 20 4.7 16 16 4.7a2 2 0 0 1 2.8 0l.5.5a2 2 0 0 1 0 2.8L8 19.3 4 20Z" />
      <path d="M14 6.5 17.5 10" />
    </Svg>
  );
}

export function IconeCaixaEntrada(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 12h4.7l1.6 2.6h4.4L15.8 12h4.7" />
      <path d="M4.4 12 5.9 5.6A1.8 1.8 0 0 1 7.6 4.3h8.8a1.8 1.8 0 0 1 1.7 1.3L19.6 12v6a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18v-6Z" />
    </Svg>
  );
}

export function IconeRelogio(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3.1 2" />
    </Svg>
  );
}

export function IconePin(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s6.5-6 6.5-11.3a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
      <circle cx="12" cy="9.6" r="2.3" />
    </Svg>
  );
}

export function IconeAlerta(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.3 21.7 20H2.3L12 3.3Z" />
      <path d="M12 10v4M12 17.2h.01" />
    </Svg>
  );
}

export function IconeAperto(props) {
  return (
    <Svg {...props}>
      <path d="M2.5 12.5l3.8-3a2 2 0 0 1 2.4 0l2 1.6" />
      <path d="M21.5 12.5l-3.8-3a2 2 0 0 0-2.4 0l-4.6 3.6a1.4 1.4 0 0 0 1.7 2.2l2.9-2" />
      <path d="M8.7 11.7l3.4 2.8a1.4 1.4 0 0 1-1.8 2.1l-.6-.5" />
      <path d="M9.7 16.1l1.9 1.6a1.4 1.4 0 1 1-1.8 2.1l-1-.8" />
    </Svg>
  );
}

export function IconeComentario(props) {
  return (
    <Svg {...props}>
      <path d="M4 5.3h16v10.4H9.8L5.6 19v-3.3H4z" />
    </Svg>
  );
}

export function IconeRaio(props) {
  return (
    <Svg {...props}>
      <path d="M13 3 4.5 14h5.7L11 21l8.5-11h-5.7L13 3Z" />
    </Svg>
  );
}

export function IconeAnexo(props) {
  return (
    <Svg {...props}>
      <path d="M7.5 12.9 15.2 5.2a3 3 0 1 1 4.2 4.3l-9 9a5 5 0 1 1-7.1-7.1L11.9 3" />
    </Svg>
  );
}

export function IconeLink(props) {
  return (
    <Svg {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 13 4.5a3.5 3.5 0 0 1 5 5l-2 2" />
      <path d="M13 17.5 11 19.5a3.5 3.5 0 0 1-5-5l2-2" />
    </Svg>
  );
}

export function IconeMais(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconeEstrela(props) {
  return (
    <Svg {...props}>
      <path d="M12 3.3l2.6 5.6 6 .7-4.4 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.2 6-.7Z" />
    </Svg>
  );
}
