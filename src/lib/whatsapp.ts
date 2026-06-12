/** Utilitários para envio de documentos por WhatsApp (Fase 2B.5 — Bloco 03/04). */

/** Remove tudo que não for dígito de um telefone (ex.: "(11) 98765-4321" -> "11987654321"). */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Monta a URL do WhatsApp Web/App com a mensagem pré-preenchida. Se o telefone for vazio, usa wa.me sem número. */
export function buildWhatsappUrl(phone: string | undefined, message: string): string {
  const digits = phone ? sanitizePhone(phone) : "";
  const phoneWithCountryCode = digits && !digits.startsWith("55") ? `55${digits}` : digits;
  const base = phoneWithCountryCode ? `https://wa.me/${phoneWithCountryCode}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Abre o WhatsApp em uma nova aba com a mensagem pré-preenchida. */
export function openWhatsapp(phone: string | undefined, message: string) {
  window.open(buildWhatsappUrl(phone, message), "_blank");
}

/** Mensagem padrão para envio de documentos (orçamento, OS, etc.) por WhatsApp. */
export function buildDocumentWhatsappMessage(params: {
  clientName: string;
  code: string;
  total: number;
}): string {
  const valor = params.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return `Olá ${params.clientName}.\n\nSegue o documento ${params.code}.\n\nValor total: ${valor}.\n\nQualquer dúvida estamos à disposição.`;
}
