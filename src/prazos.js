/* status de prazo de um cartão do kanban — compartilhado entre a página do
   Kanban e o resumo da tela de Início */
export function statusPrazo(prazo, dataReferencia = new Date()) {
  if (!prazo) return null;
  const data = new Date(prazo);
  const diffMs = data - dataReferencia;
  if (diffMs < 0) return { estado: "atrasado", diffMs };
  if (diffMs <= 24 * 3600000) return { estado: "proximo", diffMs };
  return { estado: "normal", diffMs };
}

export function formatarPrazo(prazo) {
  return new Date(prazo).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export function rotuloPrazo(prazo) {
  const status = statusPrazo(prazo);
  if (!status) return null;
  const horas = Math.abs(status.diffMs) / 3600000;
  const texto = horas < 1
    ? `${Math.round(horas * 60)} min`
    : horas < 48
      ? `${Math.round(horas)}h`
      : `${Math.round(horas / 24)} dias`;

  if (status.estado === "atrasado") return `Atrasado há ${texto}`;
  if (status.estado === "proximo") return `Vence em ${texto}`;
  return `Vence em ${formatarPrazo(prazo)}`;
}
