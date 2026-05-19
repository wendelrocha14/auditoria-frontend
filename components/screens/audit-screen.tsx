'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { FooterButton, StickyFooter } from '@/components/footer'
import { AuditItemCard } from '@/components/item-card'
import { ProgressBar, StatCard } from '@/components/progress'
import { Toast, BottomSheet, LoadingOverlay } from '@/components/overlays'
import { finalizarAuditoria, prepareItemsForFinalization } from '@/lib/api'
import type { AuditItem, AuditInfo, ToastState } from '@/lib/types'

interface AuditScreenProps {
  items: AuditItem[]
  auditInfo: AuditInfo
  onBack: () => void
  onFinish: () => void
}

export function AuditScreen({ items: initialItems, auditInfo, onBack, onFinish }: AuditScreenProps) {
  const [items, setItems] = useState<AuditItem[]>(initialItems)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' })
  const [showFinishSheet, setShowFinishSheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [horaFim, setHoraFim] = useState(new Date().toTimeString().slice(0, 5))
  
  // 🟢 ESTADO DO RELÓGIO EM TEMPO REAL
  const [currentTime, setCurrentTime] = useState('')

  // 🟢 EFFECT PARA ATUALIZAR O RELÓGIO A CADA SEGUNDO
  useEffect(() => {
    // Define o horário inicial no cliente para evitar erros de hidratação
    setCurrentTime(new Date().toLocaleTimeString('pt-BR'))

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'))
    }, 1000)

    return () => clearInterval(timer) // Limpa o intervalo ao desmontar o componente
  }, [])

  const stats = useMemo(() => {
    const auditados = items.filter(i => i.status && i.status !== 'pendente').length
    const divergentes = items.filter(i => i.status === 'divergente').length
    const ok = items.filter(i => i.status === 'ok').length
    return { auditados, divergentes, ok, total: items.length }
  }, [items])

  const pendingItems = useMemo(() => items.filter(i => !i.status || i.status === 'pendente'), [items])
  const processedItems = useMemo(() => items.filter(i => i.status && i.status !== 'pendente'), [items])

  const handleOk = async (id: string, quantitative: number) => {
    if (quantitative === -1) {
      setToast({ 
        visible: true, 
        message: 'O botão OK só aceita valores iguais ao estoque de sistema. Para valores diferentes, clique em Divergente.', 
        type: 'error' 
      })
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'ok' as const, quantidadeFisica: quantitative }
          : item
      )
    )
    setToast({ visible: true, message: 'Item confirmado!', type: 'success' })
  }

  const handleDivergent = async (id: string, quantitative: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'divergente' as const, quantidadeFisica: quantitative }
          : item
      )
    )
    setToast({ visible: true, message: 'Divergência registrada', type: 'error' })
  }

  const handleReset = async (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'pendente' as const, quantidadeFisica: undefined }
          : item
      )
    )
    setToast({ visible: true, message: 'Item retornado para pendentes', type: 'info' })
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      // 🟢 CAPTURA O HORÁRIO EXATO DO TÉRMINO NO CLIQUE DO BOTÃO
      const horaAtualTermino = new Date().toTimeString().slice(0, 5)
      
      const itensParaEnvio = prepareItemsForFinalization(items)
      
      const payload = {
        auditInfo: {
          id: auditInfo.id,
          data: auditInfo.data,
          horaInicio: auditInfo.horaInicio,
          horaFim: horaAtualTermino, // 🟢 Atualizado aqui de 'horaFim' estático para o valor dinâmico gerado agora
          grupo: auditInfo.grupo,
          empresa: auditInfo.empresa,
        },
        itens: itensParaEnvio,
      }

      const result = await finalizarAuditoria(payload)
      
      setShowFinishSheet(false)
      setToast({ 
        visible: true, 
        message: result.message || 'Auditoria finalizada com sucesso!', 
        type: 'success' 
      })
      setTimeout(onFinish, 1500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao finalizar auditoria'
      setToast({ visible: true, message: errorMessage, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        {/* ─── TOPO FIXO E ADERENTE ─── */}
        <div className="sticky top-0 z-50 bg-background pb-4 shadow-md px-4 flex flex-col">
          <div className="max-w-lg mx-auto w-full">
            <Header 
              title="Auditoria" 
              subtitle={auditInfo.id}
              onBack={onBack}
              rightAction={
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFinishSheet(true)}
                  className="px-3 py-1.5 gradient-red rounded-lg text-sm font-medium text-white"
                >
                  Finalizar
                </motion.button>
              }
            />
            
            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 mt-16"
            >
              <ProgressBar current={stats.auditados} total={stats.total} />
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3"
            >
              <StatCard
                label="Pendentes"
                value={stats.total - stats.auditados}
                variant="default"
                icon={
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="OK"
                value={stats.ok}
                variant="success"
                icon={
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              />
              <StatCard
                label="Divergentes"
                value={stats.divergentes}
                variant="danger"
                icon={
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
              />
            </motion.div>
          </div>
        </div>

        {/* ─── CONTEÚDO ROLÁVEL ─── */}
        <main className="pt-6 pb-4 px-4">
          <div className="max-w-lg mx-auto">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Itens Pendentes ({pendingItems.length})
                </h3>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {pendingItems.map((item) => (
                      <AuditItemCard
                        key={item.id}
                        item={item}
                        onOk={handleOk}
                        onDivergent={handleDivergent}
                        onReset={handleReset}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Processed Items */}
            {processedItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Itens Auditados ({processedItems.length})
                </h3>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {processedItems.map((item) => (
                      <AuditItemCard
                        key={item.id}
                        item={item}
                        onOk={handleOk}
                        onDivergent={handleDivergent}
                        onReset={handleReset}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── RODAPÉ DINÂMICO APENAS COM RELÓGIO ─── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-white/5 py-3 px-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auditoria em andamento</span>
          </div>
          <div className="font-mono bg-white/5 px-2.5 py-1 rounded-md text-foreground border border-white/5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{currentTime || '--:--:--'}</span>
          </div>
        </div>
      </footer>

      {/* ─── OVERLAYS ─── */}
      <Toast 
        isVisible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
      
      <BottomSheet 
        isOpen={showFinishSheet} 
        onClose={() => setShowFinishSheet(false)} 
        title="Finalizar Auditoria"
      >
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Deseja realmente confirmar e finalizar esta auditoria de estoque?
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFinishSheet(false)}
              className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-foreground"
            >
              Cancelar
            </button>
            <button 
              onClick={handleFinish}
              className="flex-1 py-2.5 gradient-red rounded-xl text-sm font-medium text-white"
            >
              Confirmar
            </button>
          </div>
        </div>
      </BottomSheet>
      
      <LoadingOverlay isVisible={isLoading} />
    </div>
  )
}
