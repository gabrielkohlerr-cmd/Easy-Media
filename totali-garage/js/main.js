/* Home page: filtros de estoque + grid de carros com slideshow no hover/touch. */

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const km = new Intl.NumberFormat("pt-BR");

const state = { categoria: "Todos", faixa: "all" };

function savingsPercent(car) {
  return Math.round(((car.fipe - car.preco) / car.fipe) * 100);
}

function filteredCars() {
  return CARS.filter((car) => {
    if (state.categoria !== "Todos" && car.categoria !== state.categoria) return false;
    if (state.faixa !== "all") {
      const [min, max] = state.faixa.split("-").map(Number);
      if (car.preco < min || car.preco > max) return false;
    }
    return true;
  });
}

function renderCategoryFilters() {
  const wrap = document.getElementById("category-filters");
  wrap.innerHTML = CATEGORIAS.map(
    (cat) => `<button class="chip ${cat === state.categoria ? "active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");
  wrap.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categoria = btn.dataset.cat;
      renderCategoryFilters();
      renderGrid();
    });
  });
}

function attachSlideshow(photoEl, frames) {
  let idx = 0;
  let timer = null;
  const frameEls = photoEl.querySelectorAll(".frame");
  const dotEls = photoEl.querySelectorAll(".dots span");

  function show(i) {
    idx = i;
    frameEls.forEach((f, fi) => f.classList.toggle("active", fi === i));
    dotEls.forEach((d, di) => d.classList.toggle("active", di === i));
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => show((idx + 1) % frames.length), 900);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    show(0);
  }

  photoEl.addEventListener("mouseenter", start);
  photoEl.addEventListener("mouseleave", stop);
  photoEl.addEventListener("touchstart", start, { passive: true });
  photoEl.addEventListener("touchend", stop);
  photoEl.addEventListener("touchcancel", stop);
}

function carCardHtml(car) {
  const frames = carGallery(car);
  const framesHtml = frames
    .map((svg, i) => `<div class="frame ${i === 0 ? "active" : ""}">${svg}</div>`)
    .join("");
  const dotsHtml = frames.map((_, i) => `<span class="${i === 0 ? "active" : ""}"></span>`).join("");
  const savings = savingsPercent(car);

  return `
    <article class="car-card" data-id="${car.id}">
      <div class="car-photo">
        ${framesHtml}
        <span class="badge">${car.categoria}</span>
        <div class="dots">${dotsHtml}</div>
      </div>
      <div class="car-body">
        <div class="kicker">${car.marca}</div>
        <h3>${car.modelo} ${car.versao}</h3>
        <div class="car-meta">
          <span>${car.ano}</span>
          <span>${km.format(car.km)} km</span>
          <span>${car.cambio}</span>
          <span>${car.combustivel}</span>
        </div>
        <div class="price-row">
          <span class="price">${currency.format(car.preco)}</span>
          <span class="fipe">${currency.format(car.fipe)}</span>
          <div><span class="savings">${savings}% abaixo da FIPE</span></div>
        </div>
      </div>
    </article>`;
}

function renderGrid() {
  const grid = document.getElementById("car-grid");
  const empty = document.getElementById("empty-state");
  const results = filteredCars();

  document.getElementById("results-count").textContent =
    results.length === 1 ? "1 veículo encontrado" : `${results.length} veículos encontrados`;

  if (!results.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = results.map(carCardHtml).join("");

  grid.querySelectorAll(".car-card").forEach((card) => {
    const car = results.find((c) => c.id === card.dataset.id);
    attachSlideshow(card.querySelector(".car-photo"), carGallery(car));
    card.addEventListener("click", () => {
      window.location.href = `carro.html?id=${encodeURIComponent(car.id)}`;
    });
  });
}

document.getElementById("price-filter").addEventListener("change", (e) => {
  state.faixa = e.target.value;
  renderGrid();
});

document.getElementById("year").textContent = new Date().getFullYear();

wireGenericWhatsappLinks();
renderCategoryFilters();
renderGrid();
