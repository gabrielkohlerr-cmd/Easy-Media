/* Monta os links do WhatsApp com mensagem pronta. */

const WHATSAPP_NUMBER = "5581984616161"; // +55 81 98461-6161

function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function genericWaMessage() {
  return "Olá! Vi o site da Totali Garage e gostaria de mais informações sobre os veículos disponíveis.";
}

function carWaMessage(car) {
  return (
    `Olá! Tenho interesse no ${car.marca} ${car.modelo} ${car.versao} ${car.ano} ` +
    `(Ref: ${car.id}) que vi no site da Totali Garage. Poderia me passar mais informações?`
  );
}

function consultoriaCompradorWaMessage() {
  return (
    "Olá! Quero saber mais sobre a Consultoria da Totali Garage para me ajudar a comprar um carro seminovo " +
    "(negociação, avaliação de preço, inspeção mecânica e de pintura)."
  );
}

function consultoriaVendedorWaMessage() {
  return (
    "Olá! Quero saber mais sobre a Consultoria da Totali Garage para avaliar meu carro " +
    "(inspeção mecânica, de pintura e recomendações técnicas para venda)."
  );
}

function consultoriaGenericWaMessage() {
  return "Olá! Vi o site da Totali Garage e quero saber mais sobre a Consultoria automotiva.";
}

function wireGenericWhatsappLinks() {
  const ids = ["header-whatsapp", "hero-whatsapp", "band-whatsapp", "footer-whatsapp-link", "drawer-whatsapp"];
  const href = waLink(genericWaMessage());
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}
