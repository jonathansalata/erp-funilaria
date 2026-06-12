/**
 * Histórico de alterações de status (Orçamentos e Ordens de Serviço).
 * Estrutura preparada para futura integração com auditoria real (usuário autenticado,
 * trilha de auditoria persistida no backend).
 */
export type StatusChangeEvent = {
  id: string;
  timestamp: string;
  user: string;
  from: string;
  to: string;
  reason?: string;
};

/** Usuário mockado usado para registrar alterações nesta fase (sem autenticação real). */
export const CURRENT_USER_NAME = "Ana Paula Ferreira";
