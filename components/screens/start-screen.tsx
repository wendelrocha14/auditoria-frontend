'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { FooterButton, StickyFooter } from '@/components/footer'
import { PremiumInput, PremiumSelect } from '@/components/premium-input'
import type { AuditInfo } from '@/lib/types'

interface StartScreenProps {
  onBack: () => void
  onContinue: (info: AuditInfo) => void
}

export function StartScreen({ onBack, onContinue }: StartScreenProps) {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    horaInicio: new Date().toTimeString().slice(0, 5),
    grupo: '',
    empresa: '',
    id: '',
  })

  const grupos = [
  { value: '0-marketing', label: '0-MARKETING' },
  { value: '1-couros', label: '1-COUROS' },
  { value: '2-sinteticos', label: '2-SINTÉTICOS' },
  { value: '3-tiras', label: '3-TIRAS' },
  { value: '4-elastico-zipper-atac', label: '4-ELÁSTICO/ZIPPER/ATAC' },
  { value: '5-metais-enfeites', label: '5-METAIS/ENFEITES' },
  { value: '6-pre-fabricado', label: '6-PRÉ FABRICADO' },
  { value: '7-caixas-embalagens', label: '7-CAIXAS/EMBALAGENS' },
  { value: '8-miudezas', label: '8-MIUDEZAS' },
  { value: '9-quimica', label: '9-QUÍMICA' },
  { value: '12-injetados', label: '12-INJETADOS' },
  { value: '15-tintas', label: '15-TINTAS' },
  { value: '18-cortes-costurados', label: '18-CORTES COSTURADOS' },
  { value: '19-borrachas', label: '19-BORRACHAS' },
]

const empresas = [
  { value: 'nova-hartz', label: 'Nova Hartz' },
  { value: 'jequie', label: 'Jequié' },
]

  const handleContinue = () => {
    if (!formData.grupo || !formData.empresa) return
    
    onContinue({
      ...formData,
      totalItens: 0,
      itensAuditados: 0,
      itensDivergentes: 0,
    })
  }

  const isValid = formData.data && formData.horaInicio && formData.grupo && formData.empresa

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Nova Auditoria" 
        subtitle="Preencha as informações"
        onBack={onBack}
      />
      
      <main className="pt-24 pb-32 px-4">
        <div className="max-w-lg mx-auto space-y-6">
         {/* ID Card */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-card rounded-2xl p-4 border border-border"
>
  <div className="flex items-center justify-between gap-4">
    
    <div className="flex-1">
      <p className="text-xs text-muted-foreground mb-2">
        ID da Auditoria
      </p>

      <input
        type="text"
        inputMode="numeric"
        placeholder="Digite apenas números"
        value={formData.id}
        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            id: e.target.value.replace(/\D/g, '')
          }))
        }
        className="w-full h-12 px-4 rounded-xl bg-background border border-border outline-none text-lg font-mono font-bold text-accent"
      />
      
    </div>

    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
        />
      </svg>
    </div>

  </div>
</motion.div>
          {/* Data e Hora */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-5 border border-border space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Data e Hora
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <PremiumInput
                label="Data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              />
              <PremiumInput
                label="Hora Início"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
              />
            </div>
          </motion.div>

          {/* Localização */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 border border-border space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Localização
            </h3>
            <PremiumSelect
              label="Grupo/Setor"
              options={grupos}
              value={formData.grupo}
              onChange={(e) => setFormData(prev => ({ ...prev, grupo: e.target.value }))}
            />
            <PremiumSelect
              label="Empresa/Unidade"
              options={empresas}
              value={formData.empresa}
              onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-start gap-3 p-4 bg-accent/10 rounded-2xl"
          >
            <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-muted-foreground">
              Essas informações serão usadas para identificar a auditoria no relatório final.
            </p>
          </motion.div>
        </div>
      </main>

      <StickyFooter>
        <FooterButton
          onClick={handleContinue}
          disabled={!isValid}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          }
        >
          Selecionar Itens
        </FooterButton>
      </StickyFooter>
    </div>
  )
}
