'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { FooterButton, StickyFooter } from '@/components/footer'
import { Toast, LoadingOverlay } from '@/components/overlays'
import { uploadPDF, transformAPIItems } from '@/lib/api'
import type { AuditItem, ToastState } from '@/lib/types'

interface HomeScreenProps {
  onContinue: (items: AuditItem[]) => void
}

export function HomeScreen({ onContinue }: HomeScreenProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      setToast({ visible: true, message: 'Por favor, selecione um arquivo PDF', type: 'error' })
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const response = await uploadPDF(file)
      if (response.success && response.items) {
        const transformedItems = transformAPIItems(response.items)
        setToast({ visible: true, message: 'PDF carregado com sucesso!', type: 'success' })
        setTimeout(() => onContinue(transformedItems), 500)
      } else {
        setToast({ visible: true, message: response.message || 'Erro ao processar PDF', type: 'error' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar arquivo'
      setToast({ visible: true, message: errorMessage, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Header title="Audit Pro" subtitle="Sistema de Auditoria" showLogo />
        
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-lg mx-auto">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl gradient-red flex items-center justify-center mb-4 shadow-lg shadow-accent/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Iniciar Auditoria</h2>
              <p className="text-muted-foreground">
                Faça upload do PDF com os itens para auditar
              </p>
            </motion.div>

            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-card rounded-3xl border-2 border-dashed p-8 transition-all ${
                isDragging ? 'border-accent bg-accent/10' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              
              <label htmlFor="pdf-upload" className="cursor-pointer block">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: isDragging ? 1.1 : 1 }}
                    className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4"
                  >
                    {file ? (
                      <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </motion.div>

                  {file ? (
                    <div>
                      <p className="text-foreground font-semibold mb-1">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setFile(null)
                        }}
                        className="mt-3 text-accent text-sm font-medium"
                      >
                        Trocar arquivo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground font-medium mb-1">
                        Arraste o PDF aqui
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ou toque para selecionar
                    </p>
                    </div>
                  )}
                </div>
              </label>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { icon: '📋', label: 'Organizado' },
                { icon: '⚡', label: 'Rápido' },
                { icon: '✓', label: 'Preciso' },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-2 text-xl">
                    {feature.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* ─── ASSINATURA COM DESTAQUE EM BRANCO NÍTIDO ─── */}
      <div className="w-full text-center pb-32 text-[11px] text-muted-foreground/60 tracking-wider mt-auto">
        Criado por <span className="text-white font-bold tracking-wide">WendelTech</span>
      </div>

      <StickyFooter>
        <FooterButton
          onClick={handleUpload}
          disabled={!file}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          }
        >
          Continuar
        </FooterButton>
      </StickyFooter>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <LoadingOverlay isVisible={isLoading} message="Processando PDF..." />
    </div>
  )
}
