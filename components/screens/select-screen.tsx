'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { FooterButton, StickyFooter } from '@/components/footer'
import { SelectableItemCard } from '@/components/item-card'
import type { AuditItem } from '@/lib/types'

interface SelectScreenProps {
  items: AuditItem[]
  onBack: () => void
  onContinue: (selectedItems: AuditItem[]) => void
}

export function SelectScreen({ items, onBack, onContinue }: SelectScreenProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map(i => i.id)))
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(
      item =>
        item.codigo.toLowerCase().includes(query) ||
        item.descricao.toLowerCase().includes(query) ||
        item.endereco.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  const handleToggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  const handleContinue = () => {
    const selectedItems = items.filter(item => selectedIds.has(item.id))
    onContinue(selectedItems)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Selecionar Itens" 
        subtitle={`${items.length} itens encontrados`}
        onBack={onBack}
        rightAction={
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-foreground"
          >
            {selectedIds.size === items.length ? 'Limpar' : 'Todos'}
          </motion.button>
        }
      />
      
      <main className="pt-24 pb-36 px-4">
        <div className="max-w-lg mx-auto">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-40 pb-4 bg-background"
          >
            <div className="relative">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por código, descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>

          {/* Items List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SelectableItemCard
                    item={item}
                    isSelected={selectedIds.has(item.id)}
                    onSelect={handleToggleItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-muted-foreground">Nenhum item encontrado</p>
            </motion.div>
          )}
        </div>
      </main>

      <StickyFooter>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Itens selecionados</span>
          <span className="text-lg font-bold text-accent">{selectedIds.size}</span>
        </div>
        <FooterButton
          onClick={handleContinue}
          disabled={selectedIds.size === 0}
          variant="success"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          Iniciar Auditoria
        </FooterButton>
      </StickyFooter>
    </div>
  )
}
