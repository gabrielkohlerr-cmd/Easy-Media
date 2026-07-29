/* Planos e preços — pagamento ainda não integrado, os valores abaixo
   alimentam uma simulação de compra (sem cobrança real por enquanto). */

export const PLANOS_AGENCIA = [
  { id: "basico", nome: "Básico", preco: 99.90, colaboradores: 15, clientes: 50, recomendado: false },
  { id: "premium", nome: "Premium", preco: 149.90, colaboradores: 40, clientes: 100, recomendado: true },
  { id: "unlimited", nome: "Unlimited", preco: 299.90, colaboradores: null, clientes: null, recomendado: false },
];

export const FUNCIONALIDADES_INCLUSAS = [
  "API integrada ao Instagram, pra publicar e responder comentários direto na plataforma",
  "Kanban da equipe integrado, com colunas, cores e prazos personalizáveis",
  "Calendário da equipe integrado, com a visão mensal de cada cliente",
  "Agenda de reuniões semanal integrada",
  "Link de aprovação exclusivo pra cada cliente, sem necessidade de senha",
  "Squad: gestão de colaboradores e distribuição de clientes por responsável",
  "Insights e tendências diárias, personalizados por segmento de cada cliente",
];

export const LIMITE_CLIENTES_GRATIS_FREELANCER = 20;

export const PACOTES_CLIENTES_FREELANCER = [
  { id: "mais20", nome: "+20 clientes", preco: 19.90, quantidade: 20 },
  { id: "mais30", nome: "+30 clientes", preco: 24.90, quantidade: 30 },
  { id: "mais50", nome: "+50 clientes", preco: 39.90, quantidade: 50 },
];

export function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
