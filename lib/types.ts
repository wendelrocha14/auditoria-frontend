// Tipos do sistema de auditoria

export interface AuditItem {
  id: string
  codigo: string
  descricao: string
  endereco: string
  unidade: string
  quantidadeSistema: number
  quantidadeFisica?: number
  status?: 'pendente' | 'ok' | 'divergente'
  observacao?: string
}

export interface AuditInfo {
  id: string
  data: string
  horaInicio: string
  horaFim?: string
  grupo: string
  empresa: string
  totalItens: number
  itensAuditados: number
  itensDivergentes: number
}

export interface UploadResponse {
  success: boolean
  items: AuditItem[]
  message?: string
}

export type Screen = 'home' | 'start' | 'select' | 'audit'

// Toast types
export type ToastType = 'info' | 'success' | 'error'

export interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}
