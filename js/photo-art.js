/* Gera as "vitrines" visuais dos carros em SVG (silhueta dourada sobre showroom
   em degradê), já que ainda não há fotos reais dos veículos. Cada carro recebe
   4 quadros (perfil, frontal, traseira, interior) usados na galeria/slideshow.
   Basta trocar por <img src="fotos-reais/..."> quando o acervo tiver fotos. */

const CAR_SILHOUETTE =
  "M18 118 C18 100 34 96 52 94 L74 68 C82 58 96 52 112 52 L206 52 C224 52 238 60 246 74 L262 94 " +
  "C282 96 298 102 298 118 L298 132 C298 140 292 146 284 146 L266 146 " +
  "C266 130 254 118 238 118 C222 118 210 130 210 146 L120 146 " +
  "C120 130 108 118 92 118 C76 118 64 130 64 146 L34 146 C24 146 18 140 18 132 Z";

function frameLabel(i) {
  return ["Perfil", "Frontal", "Traseira", "Interior"][i] || "Detalhe";
}

function svgShell(car, inner) {
  const hex = car.corHex || "#c9a227";
  const gradId = `grad-${car.id}`;
  const glowId = `glow-${car.id}`;
  return `
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${car.marca} ${car.modelo}">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b1626" />
          <stop offset="55%" stop-color="${hex}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#050b14" />
        </linearGradient>
        <radialGradient id="${glowId}" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#e9c46a" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#e9c46a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#${gradId})" />
      <rect width="320" height="180" fill="url(#${glowId})" />
      <g stroke="#e9c46a" stroke-opacity="0.15" stroke-width="1">
        <line x1="0" y1="150" x2="320" y2="150" />
        <line x1="0" y1="165" x2="320" y2="165" />
      </g>
      ${inner}
    </svg>`;
}

function frameProfile(car) {
  return svgShell(
    car,
    `<path d="${CAR_SILHOUETTE}" fill="none" stroke="#e9c46a" stroke-width="2" stroke-linejoin="round" />
     <circle cx="92" cy="146" r="17" fill="none" stroke="#e9c46a" stroke-width="2" />
     <circle cx="238" cy="146" r="17" fill="none" stroke="#e9c46a" stroke-width="2" />`
  );
}

function frameFront(car) {
  return svgShell(
    car,
    `<g transform="translate(-95,-10) scale(1.55)">
       <path d="${CAR_SILHOUETTE}" fill="none" stroke="#e9c46a" stroke-width="1.6" stroke-linejoin="round" />
       <circle cx="92" cy="146" r="17" fill="none" stroke="#e9c46a" stroke-width="1.6" />
     </g>
     <circle cx="128" cy="88" r="10" fill="#e9c46a" fill-opacity="0.25" stroke="#e9c46a" stroke-width="1.4" />
     <circle cx="176" cy="88" r="10" fill="#e9c46a" fill-opacity="0.25" stroke="#e9c46a" stroke-width="1.4" />`
  );
}

function frameRear(car) {
  return svgShell(
    car,
    `<g transform="translate(-140,-10) scale(1.55)">
       <path d="${CAR_SILHOUETTE}" fill="none" stroke="#e9c46a" stroke-width="1.6" stroke-linejoin="round" />
       <circle cx="238" cy="146" r="17" fill="none" stroke="#e9c46a" stroke-width="1.6" />
     </g>
     <rect x="205" y="80" width="18" height="8" rx="3" fill="#e9c46a" fill-opacity="0.3" stroke="#e9c46a" stroke-width="1.2" />
     <rect x="245" y="80" width="18" height="8" rx="3" fill="#e9c46a" fill-opacity="0.3" stroke="#e9c46a" stroke-width="1.2" />`
  );
}

function frameInterior(car) {
  return svgShell(
    car,
    `<circle cx="160" cy="110" r="34" fill="none" stroke="#e9c46a" stroke-width="2" />
     <circle cx="160" cy="110" r="8" fill="#e9c46a" fill-opacity="0.3" stroke="#e9c46a" stroke-width="1.4" />
     <line x1="160" y1="80" x2="160" y2="92" stroke="#e9c46a" stroke-width="2" />
     <path d="M40 150 C90 120 230 120 280 150" fill="none" stroke="#e9c46a" stroke-width="1.4" stroke-opacity="0.7" />
     <path d="M40 160 C90 132 230 132 280 160" fill="none" stroke="#e9c46a" stroke-width="1.2" stroke-opacity="0.4" />`
  );
}

const FRAME_BUILDERS = [frameProfile, frameFront, frameRear, frameInterior];

function carGallery(car) {
  if (car.fotos && car.fotos.length) {
    return car.fotos.map(
      (src, i) => `<img src="${src}" alt="${car.marca} ${car.modelo} — foto ${i + 1}" loading="lazy" />`
    );
  }
  return FRAME_BUILDERS.map((fn) => fn(car));
}
