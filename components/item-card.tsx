'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import type { AuditItem } from '@/lib/types'

interface ItemCardProps {
  item: AuditItem
  isSelected?: boolean
  onSelect?: (id: string) => void
  showCheckbox?: boolean
}

export function SelectableItemCard({ item, isSelected, onSelect, showCheckbox = true }: ItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(item.id)}
      className={cn(
        'bg-card rounded-2xl p-4 border transition-all cursor-pointer',
        isSelected ? 'border-green-500 shadow-lg shadow-green-500/10' : 'border-border'
      )}
    >
      <div className="flex items-start gap-4">
        {showCheckbox && (
          <motion.div
            animate={{ scale: isSelected ? 1 : 0.9 }}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors',
              isSelected ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
            )}
          >
            {isSelected && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-muted/50 text-foreground text-xs font-mono font-semibold tracking-wider rounded-md border border-border/40">
              {item.codigo}
            </span>
            <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded-md">
              {item.endereco}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium whitespace-break-spaces line-clamp-2">
            {item.descricao}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-muted-foreground">
              Qtd: <span className="text-foreground font-semibold">{item.quantidadeSistema}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {item.unidade}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface AuditItemCardProps {
  item: AuditItem
  onOk: (id: string, quantidade: number) => void
  onDivergent: (id: string, quantidade: number) => void
  onReset: (id: string) => void
}

export function AuditItemCard({ item, onOk, onDivergent, onReset }: AuditItemCardProps) {
  const [quantidade, setQuantidade] = useState<string>('')

  useEffect(() => {
    if (!item.status || item.status === 'pendente') {
      setQuantidade('')
    }
  }, [item.status])

  const statusStyles = {
    pendente: 'border-border',
    ok: 'border-success bg-success/5',
    divergente: 'border-accent bg-accent/5',
  }

  const handleOk = () => {
    const valorDigitado = quantidade === '' ? item.quantidadeSistema : Number(quantidade)

    // 💡 Atualizado: Envia -1 para o componente pai tratar o aviso na interface nativa do app
    if (valorDigitado !== item.quantidadeSistema) {
      onOk(item.id, -1)
      return
    }

    item.quantidadeFisica = item.quantidadeSistema
    setQuantidade('')
    onOk(item.id, item.quantidadeSistema)
  }

  const handleDivergent = () => {
    if (quantidade === '') return

    const valorFinal = Number(quantidade)
    if (valorFinal === item.quantidadeSistema) {
      item.quantidadeFisica = item.quantidadeSistema
      setQuantidade('')
      onOk(item.id, item.quantidadeSistema)
      return
    }

    item.quantidadeFisica = valorFinal
    onDivergent(item.id, valorFinal)
  }

  const handleReset = () => {
    setQuantidade('')
    item.status = 'pendente'
    item.quantidadeFisica = undefined
    onReset(item.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card rounded-2xl p-4 border-2 transition-all relative',
        statusStyles[item.status || 'pendente']
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-muted/50 text-foreground text-xs font-mono font-semibold tracking-wider rounded-md border border-border/40">
            {item.codigo}
          </span>
          {item.status && item.status !== 'pendente' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'px-2 py-0.5 text-xs font-semibold rounded-full uppercase',
                item.status === 'ok' ? 'bg-success text-white' : 'bg-accent text-white'
              )}
            >
              {item.status === 'ok' ? 'OK' : 'Divergente'}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">{item.endereco}</span>
          {item.status && item.status !== 'pendente' && (
            <button
              onClick={handleReset}
              className="p-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors focus:outline-none flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-foreground font-medium mb-3 leading-relaxed whitespace-break-spaces">
        {item.descricao}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sistema:</span>
          <span className="text-foreground font-bold">{item.quantidadeSistema}</span>
          <span className="text-muted-foreground">{item.unidade}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-2">
            Quantidade Física Contada
          </label>
          <input
            type="number"
            placeholder="Digite o valor ou clique OK para o sistema"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full bg-input border border-border rounded-xl py-3 px-4 text-foreground text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            inputMode="numeric"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleOk}
            className="py-3 px-4 gradient-green text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            OK
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDivergent}
            className="py-3 px-4 gradient-red text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Divergente
          </motion.button>
        </div>
      </div>

      {item.status && item.status !== 'pendente' && (
        <div className="flex items-center gap-2 text-sm mt-3 pt-3 border-t border-border/20">
          <span className="text-muted-foreground">Contado:</span>
          <span className={cn('font-bold', item.status === 'ok' ? 'text-success' : 'text-accent')}>
            {item.status === 'ok' ? item.quantidadeSistema : (item.quantidadeFisica ?? '-')}
          </span>
          <span className="text-muted-foreground">{item.unidade}</span>
        </div>
      )}
    </motion.div>
  )
}
