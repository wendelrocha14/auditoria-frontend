// Serviços para comunicação com o backend Flask
// Configure a variável de ambiente NEXT_PUBLIC_API_URL com a URL do seu servidor Flask

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface ItemFromAPI {
  codigo: string
  descricao: string
  endereco: string
  unidade: string
  quantidade: number
}

export interface AuditItemResult {
  codigo: string
  descricao: string
  endereco: string
  unidade: string
  quantidadeSistema: number
  quantidadeFisica: number
  status: 'ok' | 'divergente'
  observacao?: string
}

export interface FinalizarPayload {
  auditInfo: {
    id: string
    data: string
    horaInicio: string
    horaFim: string
    grupo: string
    empresa: string
  }
  itens: AuditItemResult[]
}

// POST /api/upload - Recebe PDF e retorna lista de itens
export async function uploadPDF(file: File): Promise<{ success: boolean; items: ItemFromAPI[]; message?: string }> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro ${response.status}: Falha ao enviar arquivo`)
    }

    const data = await response.json()
    return {
      success: true,
      items: data.items || data,
    }
  } catch (error) {
    console.error('Erro no upload:', error)
    throw error
  }
}

// POST /api/finalizar - Recebe auditoria completa e gera CSV/XLSX
// Retorna o arquivo para download automático
export async function finalizarAuditoria(payload: FinalizarPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finalizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro ${response.status}: Falha ao finalizar auditoria`)
    }

    // Verifica se a resposta é um arquivo (CSV/XLSX) para download
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('text/csv') || 
        contentType.includes('application/vnd.openxmlformats') ||
        contentType.includes('application/octet-stream')) {
      // Download automático do arquivo
      const blob = await response.blob()
      const disposition = response.headers.get('content-disposition')
      let filename = `auditoria_${payload.auditInfo.id}_${payload.auditInfo.data}.csv`
      
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '')
        }
      }

      // Cria link de download e dispara automaticamente
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true, message: 'Arquivo baixado com sucesso!' }
    }

    // Se for JSON, retorna os dados
    const data = await response.json()
    return { success: true, ...data }
  } catch (error) {
    console.error('Erro ao finalizar auditoria:', error)
    throw error
  }
}

// Função auxiliar para transformar itens da API para o formato interno
export function transformAPIItems(apiItems: ItemFromAPI[]): Array<{
  id: string
  codigo: string
  descricao: string
  endereco: string
  unidade: string
  quantidadeSistema: number
  status: 'pendente'
}> {
  return apiItems.map((item, index) => ({
    id: `item-${index + 1}-${item.codigo}`,
    codigo: item.codigo,
    descricao: item.descricao,
    endereco: item.endereco,
    unidade: item.unidade,
    quantidadeSistema: item.quantidade,
    status: 'pendente' as const,
  }))
}

// Função auxiliar para preparar itens para envio à API de finalização
export function prepareItemsForFinalization(items: Array<{
  codigo: string
  descricao: string
  endereco: string
  unidade: string
  quantidadeSistema: number
  quantidadeFisica?: number
  status?: 'pendente' | 'ok' | 'divergente'
  observacao?: string
}>): AuditItemResult[] {
  return items
    .filter(item => item.status === 'ok' || item.status === 'divergente')
    .map(item => ({
      codigo: item.codigo,
      descricao: item.descricao,
      endereco: item.endereco,
      unidade: item.unidade,
      quantidadeSistema: item.quantidadeSistema,
      quantidadeFisica: item.quantidadeFisica || 0,
      status: item.status as 'ok' | 'divergente',
      observacao: item.observacao,
    }))
}
