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

function wireGenericWhatsappLinks() {
  const ids = ["header-whatsapp", "hero-whatsapp", "band-whatsapp", "footer-whatsapp-link", "drawer-whatsapp"];
  const href = waLink(genericWaMessage());
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}
