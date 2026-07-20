/* Página de detalhes do veículo. */

const currencyD = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const kmD = new Intl.NumberFormat("pt-BR");

function savingsPercentD(car) {
  return Math.round(((car.fipe - car.preco) / car.fipe) * 100);
}

function getCarFromUrl() {
  const id = new URLSearchParams(window.location.search).get("id");
  return CARS.find((c) => c.id === id);
}

function renderNotFound(root) {
  root.innerHTML = `
    <a href="index.html#estoque" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      Voltar ao estoque
    </a>
    <div class="empty-state">Não encontramos esse veículo. Ele pode já ter sido vendido — confira o restante do nosso estoque ou fale com a gente pelo WhatsApp.</div>`;
}

function renderCar(root, car) {
  document.title = `${car.marca} ${car.modelo} ${car.ano} — Totali Garage`;

  const frames = carGallery(car);
  const savings = savingsPercentD(car);
  const labels = ["Perfil", "Frontal", "Traseira", "Interior"];

  root.innerHTML = `
    <a href="index.html#estoque" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      Voltar ao estoque
    </a>

    <div class="detail-grid">
      <div>
        <div class="gallery-main" id="gallery-main">
          ${frames.map((svg, i) => `<div class="frame ${i === 0 ? "active" : ""}" data-i="${i}">${svg}</div>`).join("")}
          <button class="gallery-nav prev" aria-label="Foto anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="gallery-nav next" aria-label="Próxima foto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <span class="frame-label" id="frame-label">${labels[0]}</span>
        </div>
        <div class="thumb-row" id="thumb-row">
          ${frames.map((svg, i) => `<div class="thumb ${i === 0 ? "active" : ""}" data-i="${i}">${svg}</div>`).join("")}
        </div>
      </div>

      <div class="detail-info">
        <div class="kicker">${car.marca} · ${car.categoria}</div>
        <h1>${car.modelo} ${car.versao} <span style="color:var(--muted); font-size:0.7em;">${car.ano}</span></h1>

        <div class="price-block">
          <div class="price">${currencyD.format(car.preco)}</div>
          <div class="fipe-line">Tabela FIPE: <del>${currencyD.format(car.fipe)}</del></div>
          <span class="savings-badge">${savings}% abaixo da FIPE</span>
        </div>

        <div class="spec-grid">
          <div class="spec-item"><div class="label">Ano</div><div class="value">${car.ano}</div></div>
          <div class="spec-item"><div class="label">Quilometragem</div><div class="value">${kmD.format(car.km)} km</div></div>
          <div class="spec-item"><div class="label">Câmbio</div><div class="value">${car.cambio}</div></div>
          <div class="spec-item"><div class="label">Combustível</div><div class="value">${car.combustivel}</div></div>
          <div class="spec-item"><div class="label">Cor</div><div class="value">${car.cor}</div></div>
          <div class="spec-item"><div class="label">Portas</div><div class="value">${car.portas}</div></div>
        </div>

        <p class="description">${car.descricao}</p>

        <ul class="feature-list">
          ${car.diferenciais.map((d) => `<li>${d}</li>`).join("")}
        </ul>

        <div class="sticky-cta">
          <a class="btn btn-gold btn-block" id="car-whatsapp" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.8-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
            Falar no WhatsApp sobre este carro
          </a>
        </div>
      </div>
    </div>`;

  document.getElementById("car-whatsapp").href = waLink(carWaMessage(car));

  const galleryMain = document.getElementById("gallery-main");
  const frameEls = galleryMain.querySelectorAll(".frame");
  const thumbEls = document.querySelectorAll("#thumb-row .thumb");
  const frameLabelEl = document.getElementById("frame-label");
  let current = 0;
  let autoTimer = null;

  function show(i) {
    current = (i + frames.length) % frames.length;
    frameEls.forEach((f, fi) => f.classList.toggle("active", fi === current));
    thumbEls.forEach((t, ti) => t.classList.toggle("active", ti === current));
    frameLabelEl.textContent = labels[current];
  }

  function startAuto() {
    if (autoTimer) return;
    autoTimer = setInterval(() => show(current + 1), 1100);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  galleryMain.querySelector(".prev").addEventListener("click", () => { stopAuto(); show(current - 1); });
  galleryMain.querySelector(".next").addEventListener("click", () => { stopAuto(); show(current + 1); });
  thumbEls.forEach((t) => t.addEventListener("click", () => { stopAuto(); show(Number(t.dataset.i)); }));

  galleryMain.addEventListener("mouseenter", startAuto);
  galleryMain.addEventListener("mouseleave", stopAuto);
  galleryMain.addEventListener("touchstart", startAuto, { passive: true });
  galleryMain.addEventListener("touchend", stopAuto);
}

const detailRoot = document.getElementById("detail-root");
const currentCar = getCarFromUrl();
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
wireGenericWhatsappLinks();

if (currentCar) {
  renderCar(detailRoot, currentCar);
} else {
  renderNotFound(detailRoot);
}
