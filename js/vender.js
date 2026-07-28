/* Página "Vender meu carro": valida o formulário, monta a mensagem e abre o WhatsApp. */

const form = document.getElementById("sell-form");
const formAlert = document.getElementById("form-alert");
const submitBtn = document.getElementById("submit-btn");
const consentError = document.getElementById("consent-error");
const formSuccess = document.getElementById("form-success");
const successWhatsappLink = document.getElementById("success-whatsapp-link");

const km = new Intl.NumberFormat("pt-BR");
const currencyNum = new Intl.NumberFormat("pt-BR");

function clearFieldError(fieldEl) {
  fieldEl.classList.remove("has-error");
}

function setFieldError(fieldEl) {
  fieldEl.classList.add("has-error");
}

function textFieldValid(input) {
  const field = input.closest(".field");
  const valid = input.value.trim().length > 0;
  valid ? clearFieldError(field) : setFieldError(field);
  return valid;
}

function radioGroupValid(name) {
  const group = form.querySelector(`.toggle-group[data-group="${name}"]`);
  const field = group.closest(".field");
  const valid = !!form.querySelector(`input[name="${name}"]:checked`);
  valid ? clearFieldError(field) : setFieldError(field);
  return valid;
}

function validateForm() {
  const checks = [
    textFieldValid(form.nome),
    textFieldValid(form.whatsapp),
    textFieldValid(form.marcaModelo),
    textFieldValid(form.ano),
    textFieldValid(form.km),
    textFieldValid(form.cor),
    textFieldValid(form.observacoes),
    radioGroupValid("cambio"),
    radioGroupValid("docEmDia"),
    radioGroupValid("debitos"),
  ];

  const consentValid = form.consentimento.checked;
  consentError.style.display = consentValid ? "none" : "block";
  checks.push(consentValid);

  return checks.every(Boolean);
}

function radioValue(name) {
  const el = form.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function buildMessage() {
  const kmValue = form.km.value.trim();
  const valorValue = form.valorPretendido.value.trim();

  const lines = [
    "Olá! Quero avaliar meu carro para venda na Totali Garage.",
    "",
    `Nome: ${form.nome.value.trim()}`,
    `WhatsApp: ${form.whatsapp.value.trim()}`,
    `Carro: ${form.marcaModelo.value.trim()}`,
    `Ano: ${form.ano.value.trim()}`,
  ];

  const versao = form.versao.value.trim();
  if (versao) lines.push(`Versão: ${versao}`);

  lines.push(`Quilometragem: ${km.format(Number(kmValue))} km`);
  lines.push(`Cor: ${form.cor.value.trim()}`);
  lines.push(`Câmbio: ${radioValue("cambio")}`);
  lines.push(`Documentação em dia: ${radioValue("docEmDia")}`);
  lines.push(`Débitos ou multas: ${radioValue("debitos")}`);

  if (valorValue) lines.push(`Valor pretendido: R$ ${currencyNum.format(Number(valorValue) || valorValue)}`);

  lines.push(`Estado geral/observações: ${form.observacoes.value.trim()}`);
  lines.push("");
  lines.push("Vou enviar as fotos aqui na conversa.");

  return lines.join("\n");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) {
    formAlert.hidden = false;
    const firstError = form.querySelector(".field.has-error") || (consentError.style.display === "block" ? consentError : null);
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  formAlert.hidden = true;

  const href = waLink(buildMessage());

  // Abre o WhatsApp já no clique (síncrono), senão o navegador bloqueia o pop-up.
  const opened = window.open(href, "_blank", "noopener");
  successWhatsappLink.href = href;

  if (!opened) {
    document.getElementById("fallback-text").textContent =
      "Não conseguimos abrir o WhatsApp automaticamente. Toque no botão abaixo para continuar.";
  }

  const label = submitBtn.querySelector(".btn-label");
  const spinner = submitBtn.querySelector(".btn-spinner");
  submitBtn.disabled = true;
  spinner.hidden = false;
  label.textContent = "Abrindo WhatsApp...";

  setTimeout(() => {
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 450);
});

document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
wireGenericWhatsappLinks();
